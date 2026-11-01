import { requireWedding } from "@/lib/wedding";
import { getOrigin, waLink } from "@/lib/origin";
import { btn, btnDanger, btnGhost, card, input, label } from "@/lib/ui";
import CopyButton from "@/components/CopyButton";
import type { InviteLink, Member } from "@/lib/types";
import { createInvite, deleteInvite, removeMember, shiftDeadlines, updateWedding } from "./actions";

const ROLE = { owner: "Pemilik", partner: "Pasangan", family: "Keluarga / panitia" } as const;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const { supabase, wedding, user } = await requireWedding();
  const origin = await getOrigin();
  const [{ data: m }, { data: i }] = await Promise.all([
    supabase.from("wedding_members").select("*").eq("wedding_id", wedding.id).order("created_at"),
    supabase.from("wedding_invites").select("*").eq("wedding_id", wedding.id).is("used_by", null).order("created_at"),
  ]);
  const members = (m ?? []) as Member[];
  const invites = (i ?? []) as InviteLink[];
  const isOwner = wedding.owner_id === user.id;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pengaturan</h1>
      {saved && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Tersimpan ✓</p>}

      <form action={updateWedding} className={card + " grid gap-4 md:grid-cols-2"}>
        <h2 className="font-semibold md:col-span-2">Data pernikahan</h2>
        <div><label className={label}>Nama pria</label><input className={input} name="groom_name" defaultValue={wedding.groom_name} required /></div>
        <div><label className={label}>Nama wanita</label><input className={input} name="bride_name" defaultValue={wedding.bride_name} required /></div>
        <div><label className={label}>Tanggal akad</label><input className={input} type="date" name="wedding_date" defaultValue={wedding.wedding_date} required /></div>
        <div><label className={label}>Kota</label><input className={input} name="city" defaultValue={wedding.city ?? ""} /></div>
        <div><label className={label}>Target jumlah tamu</label><input className={input} name="estimated_guests" defaultValue={wedding.estimated_guests ?? ""} inputMode="numeric" /></div>
        <div className="flex items-end"><button className={btn}>Simpan</button></div>
      </form>

      <form action={shiftDeadlines} className={card + " flex flex-wrap items-end gap-3"}>
        <div>
          <h2 className="font-semibold">Tanggal nikah berubah?</h2>
          <p className="text-xs text-stone-500">Geser semua tenggat checklist yang belum selesai.</p>
        </div>
        <input className={input + " w-28"} name="days" type="number" placeholder="+30" />
        <span className="text-sm text-stone-500">hari (minus untuk maju)</span>
        <button className={btnGhost}>Geser tenggat</button>
      </form>

      <section className={card + " space-y-4"}>
        <h2 className="font-semibold">Anggota tim</h2>
        <ul className="divide-y divide-stone-100 text-sm">
          {members.map((x) => (
            <li key={x.user_id} className="flex items-center justify-between py-2">
              <span>{x.email ?? x.user_id.slice(0, 8)} {x.user_id === user.id && <span className="text-stone-400">(kamu)</span>}</span>
              <span className="flex items-center gap-3">
                <span className="rounded bg-rose-50 px-2 py-0.5 text-xs text-rose-700">{ROLE[x.role]}</span>
                {isOwner && x.role !== "owner" && (
                  <form action={removeMember.bind(null, x.user_id)}><button className={btnDanger}>keluarkan</button></form>
                )}
              </span>
            </li>
          ))}
        </ul>

        <form action={createInvite} className="flex flex-wrap gap-2 border-t border-stone-100 pt-4">
          <select name="role" defaultValue="partner" className={input + " max-w-xs"}>
            <option value="partner">Undang pasangan</option>
            <option value="family">Undang keluarga / panitia</option>
          </select>
          <button className={btn}>Buat link undangan</button>
        </form>

        {invites.length > 0 && (
          <ul className="space-y-2 text-sm">
            {invites.map((x) => {
              const url = `${origin}/join/${x.token}`;
              return (
                <li key={x.token} className="flex flex-wrap items-center gap-2 rounded-lg bg-stone-50 p-2">
                  <span className="text-xs text-stone-500">{ROLE[x.role]}</span>
                  <code className="flex-1 break-all text-xs">{url}</code>
                  <CopyButton text={url} />
                  <a target="_blank" className="rounded bg-emerald-600 px-2 py-1 text-xs text-white"
                     href={waLink("", `Yuk bantu persiapan nikah kita di NikahKu: ${url}`)}>WA</a>
                  <form action={deleteInvite.bind(null, x.token)}><button className={btnDanger}>batalkan</button></form>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-xs text-stone-400">Setiap link hanya bisa dipakai 1 orang. Penerima perlu daftar/masuk dulu, lalu otomatis tergabung.</p>
      </section>
    </div>
  );
}
