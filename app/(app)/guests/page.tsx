import { requireWedding } from "@/lib/wedding";
import { btn, btnDanger, btnGhost, card, input, chipRow } from "@/lib/ui";
import type { Guest } from "@/lib/types";
import { addGuest, bulkAddGuests, deleteGuest, setRsvp } from "./actions";

const GROUPS = ["Keluarga pria", "Keluarga wanita", "Teman pria", "Teman wanita", "Kantor", "Tetangga", "Lainnya"];

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "62");
  return `https://wa.me/${digits}`;
}

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const { group } = await searchParams;
  const { supabase, wedding } = await requireWedding();
  const { data } = await supabase
    .from("guests")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true });
  const all = (data ?? []) as Guest[];
  const guests = group ? all.filter((g) => g.group_name === group) : all;

  const sum = (list: Guest[]) => list.reduce((s, g) => s + g.pax, 0);
  const invited = sum(all);
  const hadir = sum(all.filter((g) => g.rsvp_status === "hadir"));
  const tidak = sum(all.filter((g) => g.rsvp_status === "tidak"));
  const target = wedding.estimated_guests ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold md:text-2xl">Daftar tamu</h1>
          <a href="/guests/export" className={btnGhost}>⬇️ Export</a>
        </div>
        <p className="text-sm text-stone-500">
          {all.length} undangan · {invited} orang
          {target ? ` (target ${target}${invited > target ? " — melebihi target!" : ""})` : ""} · {hadir} hadir · {tidak} tidak hadir
        </p>
      </header>

      <form action={addGuest} className={card + " grid gap-2 md:grid-cols-[2fr_1.5fr_1.5fr_0.7fr_auto]"}>
        <input className={input} name="name" placeholder="Nama tamu" required />
        <input className={input} name="phone" placeholder="No. WhatsApp" inputMode="tel" />
        <select className={input} name="group_name" defaultValue="">
          <option value="">Grup…</option>
          {GROUPS.map((g) => <option key={g}>{g}</option>)}
        </select>
        <input className={input} name="pax" placeholder="Jml" defaultValue={1} inputMode="numeric" />
        <button className={btn}>Tambah</button>
      </form>

      <details className={card}>
        <summary className="cursor-pointer text-sm font-medium">Tambah banyak sekaligus</summary>
        <form action={bulkAddGuests} className="mt-3 space-y-2">
          <textarea
            name="bulk"
            rows={5}
            className={input}
            placeholder={"Satu tamu per baris: Nama, No HP, Jumlah orang\nBudi Santoso, 08123456789, 2\nSiti Aminah, , 1"}
          />
          <div className="flex gap-2">
            <select className={input + " max-w-xs"} name="group_name" defaultValue="">
              <option value="">Grup…</option>
              {GROUPS.map((g) => <option key={g}>{g}</option>)}
            </select>
            <button className={btnGhost}>Import</button>
          </div>
        </form>
      </details>

      <div className={chipRow}>
        <a href="/guests" className={`rounded-full px-3 py-1 ${!group ? "bg-rose-600 text-white" : "bg-white border border-stone-200"}`}>Semua</a>
        {GROUPS.filter((g) => all.some((x) => x.group_name === g)).map((g) => (
          <a
            key={g}
            href={`/guests?group=${encodeURIComponent(g)}`}
            className={`rounded-full px-3 py-1 ${group === g ? "bg-rose-600 text-white" : "bg-white border border-stone-200"}`}
          >
            {g} ({sum(all.filter((x) => x.group_name === g))})
          </a>
        ))}
      </div>

      {/* Tampilan kartu untuk HP */}
      <ul className="space-y-2 md:hidden">
        {guests.map((g) => (
          <li key={g.id} className={card + " !p-3"}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{g.name}</p>
                <p className="text-xs text-stone-500">{g.group_name ?? "Tanpa grup"} · {g.pax} orang</p>
              </div>
              <form action={deleteGuest.bind(null, g.id)}><button className={btnDanger} aria-label="Hapus">✕</button></form>
            </div>
            <div className="mt-2 flex items-center gap-2">
              {g.phone && (
                <a href={waLink(g.phone)} target="_blank" className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">💬 WA</a>
              )}
              <form action={setRsvp.bind(null, g.id)} className="ml-auto flex gap-1">
                <select name="rsvp_status" defaultValue={g.rsvp_status} className="rounded-lg border border-stone-200 px-2 py-1.5 text-xs">
                  <option value="pending">Belum jawab</option>
                  <option value="hadir">Hadir</option>
                  <option value="tidak">Tidak hadir</option>
                </select>
                <button className="rounded-lg bg-rose-600 px-3 text-xs text-white">✓</button>
              </form>
            </div>
          </li>
        ))}
        {guests.length === 0 && <li className="text-sm text-stone-400">Belum ada tamu.</li>}
      </ul>

      {/* Tampilan tabel untuk laptop */}
      <section className={card + " hidden overflow-x-auto md:block"}>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-stone-500">
            <tr><th className="py-2">Nama</th><th>WhatsApp</th><th>Grup</th><th>Jml</th><th>RSVP</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {guests.map((g) => (
              <tr key={g.id}>
                <td className="py-2 font-medium">{g.name}</td>
                <td>
                  {g.phone ? (
                    <a href={waLink(g.phone)} target="_blank" className="text-emerald-700 hover:underline">{g.phone}</a>
                  ) : <span className="text-stone-400">-</span>}
                </td>
                <td className="text-stone-500">{g.group_name ?? "-"}</td>
                <td>{g.pax}</td>
                <td>
                  <form action={setRsvp.bind(null, g.id)} className="flex gap-1">
                    <select name="rsvp_status" defaultValue={g.rsvp_status} className="rounded border border-stone-200 px-1 py-0.5 text-xs">
                      <option value="pending">Belum jawab</option>
                      <option value="hadir">Hadir</option>
                      <option value="tidak">Tidak hadir</option>
                    </select>
                    <button className="text-xs text-rose-600">✓</button>
                  </form>
                </td>
                <td className="text-right">
                  <form action={deleteGuest.bind(null, g.id)}><button className={btnDanger}>✕</button></form>
                </td>
              </tr>
            ))}
            {guests.length === 0 && (
              <tr><td colSpan={6} className="py-3 text-stone-400">Belum ada tamu.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
