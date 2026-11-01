import { requireWedding } from "@/lib/wedding";
import { rupiah } from "@/lib/format";
import { waLink } from "@/lib/origin";
import { btn, btnDanger, btnGhost, card, input, chipRow } from "@/lib/ui";
import type { BudgetCategory, Expense, Vendor } from "@/lib/types";
import { addVendor, deleteVendor, payVendor, updateVendor } from "./actions";

const STATUS = {
  survei: ["Survei", "bg-stone-100 text-stone-600"],
  nego: ["Nego", "bg-sky-50 text-sky-700"],
  booking: ["Booking / DP", "bg-amber-50 text-amber-700"],
  lunas: ["Lunas", "bg-emerald-50 text-emerald-700"],
  batal: ["Batal", "bg-red-50 text-red-600"],
} as const;

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const { supabase, wedding } = await requireWedding();
  const [{ data: v }, { data: c }, { data: e }] = await Promise.all([
    supabase.from("vendors").select("*").eq("wedding_id", wedding.id).order("created_at"),
    supabase.from("budget_categories").select("*").eq("wedding_id", wedding.id).order("sort_order"),
    supabase.from("expenses").select("vendor_id, amount").eq("wedding_id", wedding.id).not("vendor_id", "is", null),
  ]);
  const all = (v ?? []) as Vendor[];
  const categories = (c ?? []) as BudgetCategory[];
  const paidBy = new Map<string, number>();
  for (const x of (e ?? []) as Pick<Expense, "vendor_id" | "amount">[]) {
    if (x.vendor_id) paidBy.set(x.vendor_id, (paidBy.get(x.vendor_id) ?? 0) + Number(x.amount));
  }
  const catName = new Map(categories.map((x) => [x.id, x.name]));
  const vendors = cat ? all.filter((x) => x.category_id === cat) : all;

  const active = all.filter((x) => x.status === "booking" || x.status === "lunas");
  const totalQuote = active.reduce((s, x) => s + Number(x.price_quote), 0);
  const totalPaid = active.reduce((s, x) => s + (paidBy.get(x.id) ?? 0), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold md:text-2xl">Vendor</h1>
        <p className="text-sm text-stone-500">
          {active.length} vendor di-booking · kontrak {rupiah(totalQuote)} · dibayar {rupiah(totalPaid)} · sisa tagihan{" "}
          <b>{rupiah(totalQuote - totalPaid)}</b>
        </p>
      </header>

      <details className={card} open={all.length === 0}>
        <summary className="cursor-pointer font-medium">+ Tambah vendor / kandidat</summary>
        <form action={addVendor} className="mt-4 grid gap-2 md:grid-cols-3">
          <input className={input} name="name" placeholder="Nama vendor *" required />
          <select className={input} name="category_id" defaultValue="">
            <option value="">Kategori budget…</option>
            {categories.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <input className={input} name="service" placeholder="Layanan / paket (mis. Paket Gold 500 pax)" />
          <input className={input} name="contact_name" placeholder="Nama kontak" />
          <input className={input} name="phone" placeholder="No. WhatsApp" inputMode="tel" />
          <input className={input} name="instagram" placeholder="@instagram" />
          <input className={input} name="price_quote" placeholder="Harga penawaran (Rp)" inputMode="numeric" />
          <input className={input + " md:col-span-2"} name="note" placeholder="Catatan (termasuk apa saja, syarat DP, dll)" />
          <button className={btn + " md:col-span-3"}>Simpan vendor</button>
        </form>
      </details>

      <div className={chipRow}>
        <a href="/vendors" className={`rounded-full px-3 py-1 ${!cat ? "bg-rose-600 text-white" : "border border-stone-200 bg-white"}`}>Semua</a>
        {categories.filter((x) => all.some((y) => y.category_id === x.id)).map((x) => (
          <a key={x.id} href={`/vendors?cat=${x.id}`}
             className={`rounded-full px-3 py-1 ${cat === x.id ? "bg-rose-600 text-white" : "border border-stone-200 bg-white"}`}>
            {x.name}
          </a>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {vendors.map((x) => {
          const paid = paidBy.get(x.id) ?? 0;
          const [statusLabel, statusClass] = STATUS[x.status];
          return (
            <div key={x.id} className={card + " space-y-3"}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{x.name}</h3>
                  <p className="text-xs text-stone-500">
                    {x.category_id ? catName.get(x.category_id) : "Tanpa kategori"}{x.service ? ` · ${x.service}` : ""}
                  </p>
                </div>
                <span className={`rounded px-2 py-0.5 text-xs ${statusClass}`}>{statusLabel}</span>
              </div>

              <div className="flex flex-wrap gap-3 text-xs">
                {x.phone && <a className="text-emerald-700 hover:underline" target="_blank" href={waLink(x.phone, `Halo ${x.contact_name ?? x.name}, saya mau tanya soal paket untuk pernikahan kami.`)}>💬 WhatsApp {x.contact_name ?? ""}</a>}
                {x.instagram && <a className="text-rose-600 hover:underline" target="_blank" href={`https://instagram.com/${x.instagram}`}>📷 @{x.instagram}</a>}
              </div>
              {x.note && <p className="text-xs text-stone-600">{x.note}</p>}

              <div className="text-sm">
                Dibayar <b>{rupiah(paid)}</b> dari {rupiah(x.price_quote)}
                {x.price_quote > 0 && <span className="text-stone-500"> · sisa {rupiah(x.price_quote - paid)}</span>}
              </div>

              <form action={updateVendor.bind(null, x.id)} className="flex flex-wrap gap-2">
                <select name="status" defaultValue={x.status} className="rounded border border-stone-200 px-2 py-1 text-xs">
                  {Object.entries(STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
                </select>
                <input name="price_quote" defaultValue={x.price_quote} inputMode="numeric" className="w-32 rounded border border-stone-200 px-2 py-1 text-xs" />
                <select name="rating" defaultValue={x.rating ?? ""} className="rounded border border-stone-200 px-2 py-1 text-xs">
                  <option value="">Rating</option>
                  {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{"★".repeat(r)}</option>)}
                </select>
                <button className={btnGhost + " text-xs"}>Update</button>
              </form>

              <form action={payVendor.bind(null, x.id, x.category_id, x.name)} className="flex flex-wrap gap-2 border-t border-stone-100 pt-3">
                <input name="amount" placeholder="Bayar (Rp)" inputMode="numeric" className="w-32 rounded border border-stone-200 px-2 py-1 text-xs" required />
                <select name="type" defaultValue="dp" className="rounded border border-stone-200 px-2 py-1 text-xs">
                  <option value="dp">DP</option>
                  <option value="termin">Termin</option>
                  <option value="lunas">Pelunasan</option>
                </select>
                <button className="rounded bg-rose-600 px-2 py-1 text-xs text-white hover:bg-rose-700">Catat bayar</button>
              </form>
              <form action={deleteVendor.bind(null, x.id)} className="text-right">
                <button className={btnDanger}>hapus vendor</button>
              </form>
            </div>
          );
        })}
        {vendors.length === 0 && <p className="text-sm text-stone-500">Belum ada vendor.</p>}
      </div>
    </div>
  );
}
