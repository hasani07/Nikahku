import Link from "next/link";
import { requireWedding } from "@/lib/wedding";
import { daysUntil, formatDate, rupiah, todayISO } from "@/lib/format";
import { card } from "@/lib/ui";
import type { Doc, Expense, Guest, Task } from "@/lib/types";

function Bar({ pct, color = "bg-rose-500" }: { pct: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
      <div className={`h-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export default async function DashboardPage() {
  const { supabase, wedding } = await requireWedding();
  const id = wedding.id;

  const [{ data: tasks }, { data: expenses }, { data: docs }, { data: guests }, { data: savings }, { data: vendors }] =
    await Promise.all([
      supabase.from("tasks").select("*").eq("wedding_id", id).order("due_date"),
      supabase.from("expenses").select("amount").eq("wedding_id", id),
      supabase.from("documents").select("status").eq("wedding_id", id),
      supabase.from("guests").select("pax, rsvp_status").eq("wedding_id", id),
      supabase.from("savings").select("amount").eq("wedding_id", id),
      supabase.from("vendors").select("status").eq("wedding_id", id),
    ]);
  const saved = ((savings ?? []) as { amount: number }[]).reduce((s, x) => s + Number(x.amount), 0);
  const savedPct = wedding.total_budget ? Math.min(100, Math.round((saved / wedding.total_budget) * 100)) : 0;
  const v = (vendors ?? []) as { status: string }[];
  const booked = v.filter((x) => x.status === "booking" || x.status === "lunas").length;

  const t = (tasks ?? []) as Task[];
  const done = t.filter((x) => x.status === "done").length;
  const today = todayISO();
  const overdue = t.filter((x) => x.status !== "done" && x.due_date && x.due_date < today);
  const upcoming = t.filter((x) => x.status !== "done").slice(0, 6);

  const spent = ((expenses ?? []) as Pick<Expense, "amount">[]).reduce((s, e) => s + Number(e.amount), 0);
  const d = (docs ?? []) as Pick<Doc, "status">[];
  const docsDone = d.filter((x) => x.status === "selesai").length;
  const g = (guests ?? []) as Pick<Guest, "pax" | "rsvp_status">[];
  const invited = g.reduce((s, x) => s + x.pax, 0);
  const confirmed = g.filter((x) => x.rsvp_status === "hadir").reduce((s, x) => s + x.pax, 0);

  const days = daysUntil(wedding.wedding_date);
  const taskPct = t.length ? Math.round((done / t.length) * 100) : 0;
  const budgetPct = wedding.total_budget ? Math.round((spent / wedding.total_budget) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 p-6 text-white shadow">
        <p className="text-sm opacity-90">
          {wedding.groom_name} &amp; {wedding.bride_name} · {formatDate(wedding.wedding_date)}
          {wedding.city ? ` · ${wedding.city}` : ""}
        </p>
        <p className="mt-2 text-4xl font-bold">
          {days > 0 ? `${days} hari lagi` : days === 0 ? "Hari ini! 🎉" : "Selamat menempuh hidup baru 💕"}
        </p>
        <div className="mt-4 max-w-md">
          <div className="mb-1 flex justify-between text-sm"><span>Progres persiapan</span><span>{taskPct}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-white/30">
            <div className="h-full bg-white" style={{ width: `${taskPct}%` }} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/savings" className={card + " block hover:border-rose-300"}>
          <p className="text-sm text-stone-500">Tabungan nikah</p>
          <p className="my-1 text-xl font-semibold">{rupiah(saved)}</p>
          <p className="mb-2 text-xs text-stone-500">{savedPct}% dari target {rupiah(wedding.total_budget)}</p>
          <Bar pct={savedPct} color="bg-amber-500" />
        </Link>
        <Link href="/vendors" className={card + " block hover:border-rose-300"}>
          <p className="text-sm text-stone-500">Vendor</p>
          <p className="my-1 text-xl font-semibold">{booked} di-booking</p>
          <p className="text-xs text-stone-500">{v.length - booked} kandidat lain sedang disurvei</p>
        </Link>
        <Link href="/invitation" className={card + " block hover:border-rose-300"}>
          <p className="text-sm text-stone-500">Undangan digital</p>
          <p className="my-1 text-xl font-semibold">{wedding.invitation?.published ? "Sudah terbit 💌" : "Belum terbit"}</p>
          <p className="text-xs text-stone-500">{wedding.slug ? `/u/${wedding.slug}` : "Atur link undangan"}</p>
        </Link>
        <Link href="/budget" className={card + " block hover:border-rose-300"}>
          <p className="text-sm text-stone-500">Budget terpakai</p>
          <p className="my-1 text-xl font-semibold">{rupiah(spent)}</p>
          <p className="mb-2 text-xs text-stone-500">dari {rupiah(wedding.total_budget)} · sisa {rupiah(wedding.total_budget - spent)}</p>
          <Bar pct={budgetPct} color={budgetPct > 100 ? "bg-red-500" : "bg-rose-500"} />
        </Link>
        <Link href="/documents" className={card + " block hover:border-rose-300"}>
          <p className="text-sm text-stone-500">Dokumen nikah</p>
          <p className="my-1 text-xl font-semibold">{docsDone} / {d.length} selesai</p>
          <Bar pct={d.length ? (docsDone / d.length) * 100 : 0} color="bg-emerald-500" />
        </Link>
        <Link href="/guests" className={card + " block hover:border-rose-300"}>
          <p className="text-sm text-stone-500">Tamu</p>
          <p className="my-1 text-xl font-semibold">{invited} orang diundang</p>
          <p className="text-xs text-stone-500">{confirmed} konfirmasi hadir · target {wedding.estimated_guests ?? "-"}</p>
        </Link>
      </section>

      <section className={card}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Yang harus dikerjakan</h2>
          {overdue.length > 0 && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">{overdue.length} terlambat</span>
          )}
        </div>
        <ul className="divide-y divide-stone-100">
          {upcoming.map((x) => (
            <li key={x.id} className="flex justify-between gap-4 py-2 text-sm">
              <span>{x.title}</span>
              <span className={x.due_date && x.due_date < today ? "text-red-600" : "text-stone-500"}>
                {formatDate(x.due_date)}
              </span>
            </li>
          ))}
          {upcoming.length === 0 && <li className="py-2 text-sm text-stone-500">Semua tugas selesai 🎉</li>}
        </ul>
        <Link href="/checklist" className="mt-3 inline-block text-sm text-rose-600 hover:underline">Lihat semua checklist →</Link>
      </section>
    </div>
  );
}
