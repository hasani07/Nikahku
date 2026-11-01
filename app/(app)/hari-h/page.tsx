import Link from "next/link";
import { requireWedding } from "@/lib/wedding";
import { waLink } from "@/lib/origin";
import { btn, card, input } from "@/lib/ui";
import type { Guest, RundownItem, Vendor } from "@/lib/types";
import { toggleCheckIn, walkIn } from "./actions";

export default async function HariHPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { supabase, wedding } = await requireWedding();
  const [{ data: g }, { data: v }, { data: r }] = await Promise.all([
    supabase.from("guests").select("*").eq("wedding_id", wedding.id).order("name"),
    supabase.from("vendors").select("*").eq("wedding_id", wedding.id).in("status", ["booking", "lunas"]),
    supabase.from("rundown_items").select("*").eq("wedding_id", wedding.id).order("start_time"),
  ]);
  const guests = (g ?? []) as Guest[];
  const vendors = (v ?? []) as Vendor[];
  const rundown = (r ?? []) as RundownItem[];

  const checked = guests.filter((x) => x.checked_in_at);
  const pax = checked.reduce((s, x) => s + (x.rsvp_pax ?? x.pax), 0);
  const filtered = q
    ? guests.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()))
    : guests.filter((x) => !x.checked_in_at).slice(0, 30);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Mode Hari H 🎉</h1>
        <p className="text-sm text-stone-500">Untuk panitia penerima tamu — buka di HP.</p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className={card}><p className="text-sm text-stone-500">Tamu check-in</p><p className="text-3xl font-bold">{checked.length}</p></div>
        <div className={card}><p className="text-sm text-stone-500">Perkiraan orang hadir</p><p className="text-3xl font-bold">{pax}</p></div>
        <div className={card + " col-span-2 md:col-span-1"}><p className="text-sm text-stone-500">Total undangan</p><p className="text-3xl font-bold">{guests.length}</p></div>
      </section>

      <section className={card + " space-y-3"}>
        <h2 className="font-semibold">Check-in tamu</h2>
        <form className="flex gap-2">
          <input className={input} name="q" defaultValue={q} placeholder="Cari nama tamu…" autoFocus />
          <button className={btn}>Cari</button>
        </form>
        <ul className="divide-y divide-stone-100">
          {filtered.map((x) => (
            <li key={x.id} className="flex items-center justify-between gap-2 py-2">
              <div>
                <p className="font-medium">{x.name}</p>
                <p className="text-xs text-stone-500">{x.group_name ?? "-"} · {x.rsvp_pax ?? x.pax} orang</p>
              </div>
              <form action={toggleCheckIn.bind(null, x.id, !!x.checked_in_at)}>
                <button className={x.checked_in_at
                  ? "rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white"
                  : "rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-700"}>
                  {x.checked_in_at ? "✓ Hadir" : "Check-in"}
                </button>
              </form>
            </li>
          ))}
          {filtered.length === 0 && <li className="py-2 text-sm text-stone-400">Tidak ditemukan.</li>}
        </ul>
        <form action={walkIn} className="flex gap-2 border-t border-stone-100 pt-3">
          <input className={input} name="name" placeholder="Tamu tidak terdaftar — nama" required />
          <input className={input + " w-20"} name="pax" defaultValue={1} inputMode="numeric" />
          <button className={btn}>+ Hadir</button>
        </form>
      </section>

      <section className={card}>
        <h2 className="mb-2 font-semibold">Kontak darurat vendor</h2>
        <ul className="divide-y divide-stone-100 text-sm">
          {vendors.map((x) => (
            <li key={x.id} className="flex justify-between py-2">
              <span>{x.name} <span className="text-stone-400">{x.contact_name ? `· ${x.contact_name}` : ""}</span></span>
              {x.phone ? (
                <span className="flex gap-3">
                  <a className="text-rose-600" href={`tel:${x.phone}`}>📞 Telepon</a>
                  <a className="text-emerald-700" target="_blank" href={waLink(x.phone)}>💬 WA</a>
                </span>
              ) : <span className="text-stone-400">-</span>}
            </li>
          ))}
          {vendors.length === 0 && <li className="py-2 text-stone-400">Belum ada vendor berstatus booking/lunas.</li>}
        </ul>
      </section>

      <section className={card}>
        <div className="mb-2 flex justify-between">
          <h2 className="font-semibold">Rundown</h2>
          <Link href="/rundown" className="text-sm text-rose-600">Edit →</Link>
        </div>
        <ul className="text-sm">
          {rundown.map((i) => (
            <li key={i.id} className="flex gap-3 py-1">
              <span className="w-12 font-mono text-xs text-stone-500">{i.start_time?.slice(0, 5) ?? "--:--"}</span>
              <span>{i.activity}{i.pic ? <span className="text-stone-400"> · {i.pic}</span> : null}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
