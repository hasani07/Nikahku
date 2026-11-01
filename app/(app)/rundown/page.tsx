import { requireWedding } from "@/lib/wedding";
import { formatDate } from "@/lib/format";
import { btn, btnDanger, btnGhost, card, input } from "@/lib/ui";
import PrintButton from "@/components/PrintButton";
import type { RundownItem } from "@/lib/types";
import { addRundown, deleteRundown, seedRundown } from "./actions";

const SESSIONS = [
  ["akad", "Akad / Pemberkatan"],
  ["resepsi", "Resepsi"],
  ["lainnya", "Lainnya"],
] as const;

const t = (v: string | null) => (v ? v.slice(0, 5) : "--:--");

export default async function RundownPage() {
  const { supabase, wedding } = await requireWedding();
  const { data } = await supabase
    .from("rundown_items")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("start_time", { ascending: true, nullsFirst: false });
  const items = (data ?? []) as RundownItem[];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Rundown acara</h1>
          <p className="text-sm text-stone-500">
            {wedding.groom_name} &amp; {wedding.bride_name} · {formatDate(wedding.wedding_date)}
          </p>
        </div>
        <div className="flex gap-2">
          {items.length === 0 && (
            <form action={seedRundown}><button className={btnGhost}>✨ Isi contoh rundown</button></form>
          )}
          <PrintButton />
        </div>
      </header>

      <form action={addRundown} className={card + " no-print grid gap-2 md:grid-cols-[1fr_0.8fr_0.8fr_2fr_1fr_1fr_auto]"}>
        <select className={input} name="session" defaultValue="akad">
          {SESSIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input className={input} type="time" name="start_time" />
        <input className={input} type="time" name="end_time" />
        <input className={input} name="activity" placeholder="Kegiatan" required />
        <input className={input} name="pic" placeholder="PIC" />
        <input className={input} name="location" placeholder="Lokasi" />
        <button className={btn}>Tambah</button>
      </form>

      {SESSIONS.map(([session, title]) => {
        const list = items.filter((i) => i.session === session);
        if (!list.length) return null;
        return (
          <section key={session} className={card}>
            <h2 className="mb-3 font-semibold">{title}</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-stone-500">
                <tr><th className="w-32 py-1">Waktu</th><th>Kegiatan</th><th>PIC</th><th>Lokasi</th><th className="no-print" /></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {list.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2 font-mono text-xs">{t(i.start_time)} – {t(i.end_time)}</td>
                    <td>{i.activity}</td>
                    <td className="text-stone-500">{i.pic ?? "-"}</td>
                    <td className="text-stone-500">{i.location ?? "-"}</td>
                    <td className="no-print text-right">
                      <form action={deleteRundown.bind(null, i.id)}><button className={btnDanger}>✕</button></form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}
