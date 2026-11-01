import { requireWedding } from "@/lib/wedding";
import { rupiah } from "@/lib/format";
import { btn, btnDanger, card, input, tableWrap } from "@/lib/ui";
import PrintButton from "@/components/PrintButton";
import type { Gift } from "@/lib/types";
import { addGift, deleteGift, toggleThanked } from "./actions";

const KIND = { amplop: "✉️ Amplop", kado: "🎁 Kado", transfer: "💳 Transfer" } as const;

export default async function GiftsPage() {
  const { supabase, wedding } = await requireWedding();
  const { data } = await supabase
    .from("gifts")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false });
  const gifts = (data ?? []) as Gift[];
  const total = gifts.reduce((s, g) => s + Number(g.amount ?? 0), 0);
  const thanked = gifts.filter((g) => g.thanked).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Rekap amplop &amp; hadiah</h1>
          <p className="text-sm text-stone-500">
            {gifts.length} pemberian · total uang {rupiah(total)} · {thanked}/{gifts.length} sudah diberi ucapan terima kasih
          </p>
        </div>
        <PrintButton />
      </header>

      <form action={addGift} className={card + " no-print grid gap-2 md:grid-cols-[2fr_1fr_1fr_2fr_auto]"}>
        <input className={input} name="from_name" placeholder="Dari (nama)" required />
        <select className={input} name="kind" defaultValue="amplop">
          {Object.entries(KIND).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <input className={input} name="amount" placeholder="Nominal (Rp)" inputMode="numeric" />
        <input className={input} name="note" placeholder="Keterangan kado / catatan" />
        <button className={btn}>Catat</button>
      </form>

      <section className={card}>
        <div className={tableWrap}><table className="min-w-[560px] w-full text-sm">
          <thead className="text-left text-xs text-stone-500">
            <tr><th className="py-2">Dari</th><th>Jenis</th><th>Keterangan</th><th className="text-right">Nominal</th><th className="text-center">Terima kasih</th><th className="no-print" /></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {gifts.map((g) => (
              <tr key={g.id}>
                <td className="py-2 font-medium">{g.from_name}</td>
                <td>{KIND[g.kind]}</td>
                <td className="text-stone-500">{g.note ?? "-"}</td>
                <td className="text-right">{g.amount ? rupiah(g.amount) : "-"}</td>
                <td className="text-center">
                  <form action={toggleThanked.bind(null, g.id, g.thanked)}>
                    <button className={g.thanked ? "text-emerald-600" : "text-stone-300"}>{g.thanked ? "✓ sudah" : "○ belum"}</button>
                  </form>
                </td>
                <td className="no-print text-right">
                  <form action={deleteGift.bind(null, g.id)}><button className={btnDanger}>✕</button></form>
                </td>
              </tr>
            ))}
            {gifts.length === 0 && <tr><td colSpan={6} className="py-3 text-stone-400">Belum ada catatan. Isi setelah acara selesai.</td></tr>}
          </tbody>
        </table></div>
      </section>
    </div>
  );
}
