import { requireWedding } from "@/lib/wedding";
import { daysUntil, formatDate, rupiah, todayISO } from "@/lib/format";
import { btn, btnDanger, card, input } from "@/lib/ui";
import type { Saving } from "@/lib/types";
import { addSaving, deleteSaving } from "./actions";

export default async function SavingsPage() {
  const { supabase, wedding } = await requireWedding();
  const { data } = await supabase
    .from("savings")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("saved_at", { ascending: false });
  const list = (data ?? []) as Saving[];

  const target = Number(wedding.total_budget);
  const saved = list.reduce((s, x) => s + Number(x.amount), 0);
  const remaining = Math.max(0, target - saved);
  const days = daysUntil(wedding.wedding_date);
  const monthsLeft = Math.max(1, Math.ceil(days / 30));
  const perMonth = Math.ceil(remaining / monthsLeft);
  const pct = target ? Math.min(100, Math.round((saved / target) * 100)) : 0;

  // rata-rata setoran per bulan sejauh ini → proyeksi
  const first = list.length ? list[list.length - 1].saved_at : todayISO();
  const monthsSoFar = Math.max(1, Math.ceil(-daysUntil(first) / 30));
  const avgPerMonth = Math.round(saved / monthsSoFar);
  const projected = saved + avgPerMonth * monthsLeft;
  const onTrack = projected >= target;

  const byWhom = new Map<string, number>();
  list.forEach((x) => byWhom.set(x.by_whom || "Lainnya", (byWhom.get(x.by_whom || "Lainnya") ?? 0) + Number(x.amount)));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Target tabungan nikah</h1>

      <section className={card}>
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm text-stone-500">Terkumpul</p>
            <p className="text-3xl font-bold">{rupiah(saved)}</p>
            <p className="text-sm text-stone-500">dari target {rupiah(target)} (total budget)</p>
          </div>
          <p className="text-3xl font-bold text-rose-600">{pct}%</p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-stone-100">
          <div className="h-full bg-rose-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-rose-50 p-3">
            <p className="text-xs text-stone-500">Kekurangan</p>
            <p className="font-semibold">{rupiah(remaining)}</p>
          </div>
          <div className="rounded-xl bg-rose-50 p-3">
            <p className="text-xs text-stone-500">Perlu ditabung per bulan ({monthsLeft} bln lagi)</p>
            <p className="font-semibold">{rupiah(perMonth)}</p>
          </div>
          <div className={`rounded-xl p-3 ${onTrack ? "bg-emerald-50" : "bg-amber-50"}`}>
            <p className="text-xs text-stone-500">Proyeksi dengan rata-rata {rupiah(avgPerMonth)}/bln</p>
            <p className={`font-semibold ${onTrack ? "text-emerald-700" : "text-amber-700"}`}>
              {onTrack ? "✓ Target tercapai" : `Kurang ± ${rupiah(target - projected)}`}
            </p>
          </div>
        </div>
        {byWhom.size > 0 && (
          <p className="mt-3 text-xs text-stone-500">
            Kontribusi: {[...byWhom.entries()].map(([k, v]) => `${k} ${rupiah(v)}`).join(" · ")}
          </p>
        )}
      </section>

      <form action={addSaving} className={card + " grid gap-2 md:grid-cols-[1fr_1fr_1fr_1.5fr_auto]"}>
        <input className={input} name="amount" placeholder="Nominal setoran" inputMode="numeric" required />
        <input className={input} type="date" name="saved_at" defaultValue={todayISO()} />
        <input className={input} name="by_whom" placeholder={`Dari (mis. ${wedding.groom_name})`} />
        <input className={input} name="note" placeholder="Catatan" />
        <button className={btn}>Setor</button>
      </form>

      <section className={card}>
        <h2 className="mb-2 font-semibold">Riwayat setoran</h2>
        <ul className="divide-y divide-stone-100 text-sm">
          {list.map((x) => (
            <li key={x.id} className="flex items-center gap-3 py-2">
              <span className="w-28 text-stone-500">{formatDate(x.saved_at)}</span>
              <span className="flex-1">{x.by_whom ?? "-"}{x.note ? ` · ${x.note}` : ""}</span>
              <span className="font-medium">{rupiah(x.amount)}</span>
              <form action={deleteSaving.bind(null, x.id)}><button className={btnDanger}>✕</button></form>
            </li>
          ))}
          {list.length === 0 && <li className="py-2 text-stone-400">Belum ada setoran.</li>}
        </ul>
      </section>
    </div>
  );
}
