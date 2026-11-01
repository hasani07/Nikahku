import { requireWedding } from "@/lib/wedding";
import { formatDate, rupiah, todayISO } from "@/lib/format";
import { btn, btnDanger, btnGhost, card, input, tableWrap } from "@/lib/ui";
import type { BudgetCategory, Expense, Vendor } from "@/lib/types";
import PrintButton from "@/components/PrintButton";
import { addCategory, addExpense, deleteExpense, updatePlanned, updateTotalBudget } from "./actions";

const TYPE_LABEL = { dp: "DP", termin: "Termin", lunas: "Lunas" } as const;

export default async function BudgetPage() {
  const { supabase, wedding } = await requireWedding();
  const [{ data: cats }, { data: exps }, { data: vens }] = await Promise.all([
    supabase.from("budget_categories").select("*").eq("wedding_id", wedding.id).order("sort_order"),
    supabase.from("expenses").select("*").eq("wedding_id", wedding.id).order("paid_at", { ascending: false }),
    supabase.from("vendors").select("id, name").eq("wedding_id", wedding.id).neq("status", "batal").order("name"),
  ]);
  const categories = (cats ?? []) as BudgetCategory[];
  const expenses = (exps ?? []) as Expense[];
  const vendors = (vens ?? []) as Pick<Vendor, "id" | "name">[];
  const vendorName = new Map(vendors.map((v) => [v.id, v.name]));

  const spentBy = new Map<string, number>();
  for (const e of expenses) {
    const k = e.category_id ?? "none";
    spentBy.set(k, (spentBy.get(k) ?? 0) + Number(e.amount));
  }
  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalPlanned = categories.reduce((s, c) => s + Number(c.planned_amount), 0);
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <h1 className="text-xl font-bold md:text-2xl">Budget planner</h1>
        <PrintButton />
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <form action={updateTotalBudget} className={card}>
          <p className="text-sm text-stone-500">Total budget</p>
          <div className="mt-1 flex gap-2">
            <input className={input} name="total_budget" defaultValue={wedding.total_budget} inputMode="numeric" />
            <button className={btnGhost}>✓</button>
          </div>
        </form>
        <div className={card}>
          <p className="text-sm text-stone-500">Dialokasikan</p>
          <p className={`mt-1 text-xl font-semibold ${totalPlanned > wedding.total_budget ? "text-red-600" : ""}`}>{rupiah(totalPlanned)}</p>
        </div>
        <div className={card}>
          <p className="text-sm text-stone-500">Sudah dibayar</p>
          <p className="mt-1 text-xl font-semibold">{rupiah(totalSpent)}</p>
        </div>
        <div className={card}>
          <p className="text-sm text-stone-500">Sisa dana</p>
          <p className={`mt-1 text-xl font-semibold ${wedding.total_budget - totalSpent < 0 ? "text-red-600" : "text-emerald-600"}`}>
            {rupiah(wedding.total_budget - totalSpent)}
          </p>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-3 font-semibold">Per kategori</h2>
        <div className="space-y-3">
          {categories.map((c) => {
            const spent = spentBy.get(c.id) ?? 0;
            const pct = c.planned_amount ? Math.round((spent / c.planned_amount) * 100) : 0;
            return (
              <div key={c.id} className="grid items-center gap-2 md:grid-cols-[1.5fr_1fr_2fr]">
                <span className="text-sm font-medium">{c.name}</span>
                <form action={updatePlanned.bind(null, c.id)}>
                  <input
                    name="planned"
                    defaultValue={c.planned_amount}
                    inputMode="numeric"
                    className="w-full rounded border border-stone-200 px-2 py-1 text-sm focus:border-rose-300 focus:outline-none"
                  />
                </form>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-stone-500">
                    <span>{rupiah(spent)} terpakai</span>
                    <span className={pct > 100 ? "text-red-600" : ""}>{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                    <div className={`h-full ${pct > 100 ? "bg-red-500" : "bg-rose-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-stone-400">Ubah angka rencana lalu tekan Enter untuk menyimpan.</p>
        <form action={addCategory} className="mt-4 flex flex-wrap gap-2">
          <input className={input + " max-w-xs"} name="name" placeholder="Kategori baru" required />
          <input className={input + " max-w-[10rem]"} name="planned" placeholder="Rencana (Rp)" inputMode="numeric" />
          <button className={btnGhost}>+ Kategori</button>
        </form>
      </section>

      <section className={card}>
        <h2 className="mb-3 font-semibold">Catat pembayaran</h2>
        <form action={addExpense} className="no-print grid gap-2 md:grid-cols-[1.1fr_1fr_1.3fr_1fr_0.8fr_1fr_auto]">
          <select className={input} name="category_id" required defaultValue="">
            <option value="" disabled>Kategori…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className={input} name="vendor_id" defaultValue="">
            <option value="">Vendor (opsional)</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <input className={input} name="title" placeholder="Keterangan (mis. DP catering)" />
          <input className={input} name="amount" placeholder="Nominal" inputMode="numeric" required />
          <select className={input} name="type" defaultValue="dp">
            <option value="dp">DP</option>
            <option value="termin">Termin</option>
            <option value="lunas">Lunas</option>
          </select>
          <input className={input} type="date" name="paid_at" defaultValue={todayISO()} />
          <button className={btn}>Simpan</button>
        </form>

        <div className={tableWrap}><table className="min-w-[560px] mt-4 w-full text-sm">
          <thead className="text-left text-xs text-stone-500">
            <tr><th className="py-2">Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jenis</th><th className="text-right">Nominal</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {expenses.map((e) => (
              <tr key={e.id}>
                <td className="py-2 text-stone-500">{formatDate(e.paid_at)}</td>
                <td>
                  {e.title}
                  {e.vendor_id && vendorName.get(e.vendor_id) && (
                    <span className="text-xs text-stone-400"> · {vendorName.get(e.vendor_id)}</span>
                  )}
                </td>
                <td className="text-stone-500">{e.category_id ? catName.get(e.category_id) : "-"}</td>
                <td><span className="rounded bg-rose-50 px-1.5 py-0.5 text-xs text-rose-700">{TYPE_LABEL[e.type]}</span></td>
                <td className="text-right font-medium">{rupiah(e.amount)}</td>
                <td className="text-right">
                  <form action={deleteExpense.bind(null, e.id)}><button className={btnDanger}>✕</button></form>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan={6} className="py-3 text-stone-400">Belum ada pembayaran tercatat.</td></tr>
            )}
          </tbody>
        </table></div>
      </section>
    </div>
  );
}
