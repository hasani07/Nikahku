-- =========================================================
-- NikahKu — skema awal (MVP)
-- Jalankan di Supabase: SQL Editor → New query → paste → Run
-- =========================================================

create extension if not exists pgcrypto;

-- ---------- Tabel ----------
create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade default auth.uid(),
  groom_name text not null,
  bride_name text not null,
  wedding_date date not null,
  city text,
  religion text not null default 'islam',
  concept text,
  estimated_guests int,
  total_budget bigint not null default 0,
  slug text unique,
  created_at timestamptz not null default now()
);

create table public.wedding_members (
  wedding_id uuid references public.weddings on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text not null default 'partner' check (role in ('owner','partner','family')),
  created_at timestamptz not null default now(),
  primary key (wedding_id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  title text not null,
  phase text not null default 'Lainnya',
  due_date date,
  assignee text,
  status text not null default 'todo' check (status in ('todo','done')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  name text not null,
  planned_amount bigint not null default 0,
  sort_order int not null default 0
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  category_id uuid references public.budget_categories on delete set null,
  title text not null,
  amount bigint not null,
  type text not null default 'dp' check (type in ('dp','termin','lunas')),
  paid_at date default current_date,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  owner_side text not null default 'bersama' check (owner_side in ('pria','wanita','bersama')),
  name text not null,
  status text not null default 'belum' check (status in ('belum','proses','selesai')),
  file_path text,
  sort_order int not null default 0
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references public.weddings on delete cascade,
  name text not null,
  phone text,
  group_name text,
  pax int not null default 1,
  rsvp_status text not null default 'pending' check (rsvp_status in ('pending','hadir','tidak')),
  rsvp_pax int,
  message text,
  invite_code text unique default substr(md5(random()::text), 1, 8),
  created_at timestamptz not null default now()
);

create index on public.tasks (wedding_id, due_date);
create index on public.expenses (wedding_id);
create index on public.documents (wedding_id);
create index on public.guests (wedding_id);

-- ---------- Helper & trigger ----------
create or replace function public.is_member(w uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.wedding_members
    where wedding_id = w and user_id = auth.uid()
  );
$$;

-- pembuat wedding otomatis jadi owner
create or replace function public.handle_new_wedding()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.wedding_members (wedding_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger on_wedding_created
  after insert on public.weddings
  for each row execute function public.handle_new_wedding();

-- ---------- Row Level Security ----------
alter table public.weddings          enable row level security;
alter table public.wedding_members   enable row level security;
alter table public.tasks             enable row level security;
alter table public.budget_categories enable row level security;
alter table public.expenses          enable row level security;
alter table public.documents         enable row level security;
alter table public.guests            enable row level security;

create policy "weddings: member read" on public.weddings
  for select using (owner_id = auth.uid() or public.is_member(id));
create policy "weddings: user create" on public.weddings
  for insert with check (owner_id = auth.uid());
create policy "weddings: member update" on public.weddings
  for update using (public.is_member(id));
create policy "weddings: owner delete" on public.weddings
  for delete using (owner_id = auth.uid());

create policy "members: read" on public.wedding_members
  for select using (user_id = auth.uid() or public.is_member(wedding_id));

create policy "tasks: member all" on public.tasks
  for all using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy "budget: member all" on public.budget_categories
  for all using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy "expenses: member all" on public.expenses
  for all using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy "documents: member all" on public.documents
  for all using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));
create policy "guests: member all" on public.guests
  for all using (public.is_member(wedding_id)) with check (public.is_member(wedding_id));

-- ---------- Storage: bucket privat untuk scan dokumen ----------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- path file: <wedding_id>/<nama-file>
create policy "documents bucket: member access" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'documents'
    and public.is_member(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'documents'
    and public.is_member(((storage.foldername(name))[1])::uuid)
  );
