-- =========================================================
-- NikahKu — Fase 2 & 3
-- Jalankan SETELAH 0001_init.sql (SQL Editor → New query → Run)
-- =========================================================

-- ---------- Kolom tambahan ----------
alter table public.weddings        add column if not exists invitation jsonb not null default '{}'::jsonb;
alter table public.wedding_members add column if not exists email text;
alter table public.guests          add column if not exists checked_in_at timestamptz;

-- simpan email anggota supaya bisa ditampilkan di halaman Pengaturan
create or replace function public.handle_new_wedding()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.wedding_members (wedding_id, user_id, role, email)
  values (new.id, new.owner_id, 'owner', (select email from auth.users where id = new.owner_id));
  return new;
end;
$$;

update public.wedding_members m set email = u.email
from auth.users u where u.id = m.user_id and m.email is null;

-- ---------- Kolaborasi: link undangan anggota ----------
create table public.wedding_invites (
  token text primary key default replace(gen_random_uuid()::text, '-', ''),
  wedding_id uuid not null references public.weddings on delete cascade,
  role text not null default 'partner' check (role in ('partner','family')),
  created_at timestamptz not null default now(),
  used_by uuid references auth.users on delete set null,
  used_at timestamptz
);

create or replace function public.accept_invite(p_token text)
returns uuid language plpgsql security definer set search_path = public as $$
declare inv public.wedding_invites;
begin
  if auth.uid() is null then raise exception 'Silakan login dulu'; end if;
  select * into inv from public.wedding_invites where token = p_token;
  if not found then raise exception 'Link undangan tidak ditemukan'; end if;
  if inv.used_by is not null and inv.used_by <> auth.uid() then
    raise exception 'Link undangan sudah dipakai orang lain';
  end if;
  insert into public.wedding_members (wedding_id, user_id, role, email)
  values (inv.wedding_id, auth.uid(), inv.role, (select email from auth.users where id = auth.uid()))
  on conflict (wedding_id, user_id) do nothing;
  update public.wedding_invites set used_by = auth.uid(), used_at = now() where token = p_token;
  return inv.wedding_id;
end;
$$;
revoke execute on function public.accept_invite(text) from anon, public;
grant execute on function public.accept_invite(text) to authenticated;

-- ---------- Tabel fitur ----------
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  category_id uuid references public.budget_categories on delete set null,
  name text not null,
  service text,
  contact_name text,
  phone text,
  instagram text,
  price_quote bigint not null default 0,
  status text not null default 'survei' check (status in ('survei','nego','booking','lunas','batal')),
  rating int check (rating between 1 and 5),
  note text,
  created_at timestamptz not null default now()
);

alter table public.expenses add column if not exists vendor_id uuid references public.vendors on delete set null;

create table public.savings (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  amount bigint not null,
  saved_at date not null default current_date,
  by_whom text,
  note text,
  created_at timestamptz not null default now()
);

create table public.rundown_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  session text not null default 'akad' check (session in ('akad','resepsi','lainnya')),
  start_time time,
  end_time time,
  activity text not null,
  pic text,
  location text,
  created_at timestamptz not null default now()
);

create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  from_name text not null,
  kind text not null default 'amplop' check (kind in ('amplop','kado','transfer')),
  amount bigint,
  note text,
  thanked boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  guest_id uuid references public.guests on delete set null,
  name text not null,
  attendance text,
  pax int,
  message text,
  created_at timestamptz not null default now()
);

create index on public.vendors (wedding_id);
create index on public.savings (wedding_id);
create index on public.rundown_items (wedding_id);
create index on public.gifts (wedding_id);
create index on public.wishes (wedding_id, created_at desc);

-- ---------- RLS ----------
alter table public.wedding_invites enable row level security;
alter table public.vendors         enable row level security;
alter table public.savings         enable row level security;
alter table public.rundown_items   enable row level security;
alter table public.gifts           enable row level security;
alter table public.wishes          enable row level security;

create policy "invites: member all" on public.wedding_invites
  for all using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy "vendors: member all" on public.vendors
  for all using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy "savings: member all" on public.savings
  for all using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy "rundown: member all" on public.rundown_items
  for all using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy "gifts: member all" on public.gifts
  for all using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy "wishes: member read" on public.wishes
  for select using (public.is_member(wedding_id));
create policy "wishes: member delete" on public.wishes
  for delete using (public.is_member(wedding_id));

create policy "members: owner remove" on public.wedding_members
  for delete using (
    exists (select 1 from public.weddings w where w.id = wedding_id and w.owner_id = auth.uid())
    and user_id <> auth.uid()
  );

-- ---------- Storage publik (foto sampul undangan) ----------
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

create policy "public-assets: member write" on storage.objects
  for all to authenticated
  using (bucket_id = 'public-assets' and public.is_member(((storage.foldername(name))[1])::uuid))
  with check (bucket_id = 'public-assets' and public.is_member(((storage.foldername(name))[1])::uuid));

-- ---------- RPC undangan publik (bisa diakses tanpa login) ----------
create or replace function public.get_invitation(p_slug text, p_code text default null)
returns jsonb language plpgsql security definer stable set search_path = public as $$
declare
  w public.weddings;
  g public.guests;
begin
  select * into w from public.weddings
  where slug = p_slug and coalesce((invitation->>'published')::boolean, false);
  if not found then return null; end if;

  if coalesce(p_code, '') <> '' then
    select * into g from public.guests where wedding_id = w.id and invite_code = p_code;
  end if;

  return jsonb_build_object(
    'groom_name', w.groom_name,
    'bride_name', w.bride_name,
    'wedding_date', w.wedding_date,
    'city', w.city,
    'invitation', w.invitation,
    'guest', case when g.id is null then null
             else jsonb_build_object('name', g.name, 'pax', g.pax, 'rsvp_status', g.rsvp_status) end,
    'wishes', coalesce((
      select jsonb_agg(jsonb_build_object('name', x.name, 'message', x.message,
                                          'attendance', x.attendance, 'created_at', x.created_at)
                       order by x.created_at desc)
      from (select * from public.wishes
            where wedding_id = w.id and coalesce(message, '') <> ''
            order by created_at desc limit 50) x
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.submit_rsvp(
  p_slug text, p_code text, p_name text, p_attendance text, p_pax int, p_message text
) returns void language plpgsql security definer set search_path = public as $$
declare
  w_id uuid;
  g_id uuid;
  v_pax int := greatest(0, least(coalesce(p_pax, 1), 20));
begin
  select id into w_id from public.weddings
  where slug = p_slug and coalesce((invitation->>'published')::boolean, false);
  if w_id is null then raise exception 'Undangan tidak ditemukan'; end if;
  if p_attendance not in ('hadir', 'tidak') then raise exception 'Status kehadiran tidak valid'; end if;
  if length(trim(coalesce(p_name, ''))) = 0 or length(p_name) > 100 or length(coalesce(p_message, '')) > 1000 then
    raise exception 'Data tidak valid';
  end if;

  if coalesce(p_code, '') <> '' then
    update public.guests
       set rsvp_status = p_attendance, rsvp_pax = v_pax, message = nullif(p_message, '')
     where wedding_id = w_id and invite_code = p_code
    returning id into g_id;
  end if;

  insert into public.wishes (wedding_id, guest_id, name, attendance, pax, message)
  values (w_id, g_id, trim(p_name), p_attendance, v_pax, nullif(trim(p_message), ''));
end;
$$;

grant execute on function public.get_invitation(text, text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, text, text, text, int, text) to anon, authenticated;
