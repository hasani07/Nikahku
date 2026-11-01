import { requireWedding } from "@/lib/wedding";
import { PHASES } from "@/lib/templates";
import { formatDate, todayISO } from "@/lib/format";
import { btn, btnDanger, card, input } from "@/lib/ui";
import type { Task } from "@/lib/types";
import { addTask, deleteTask, toggleTask, updateAssignee } from "./actions";

export default async function ChecklistPage() {
  const { supabase, wedding } = await requireWedding();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("due_date", { ascending: true })
    .order("sort_order", { ascending: true });
  const tasks = (data ?? []) as Task[];
  const today = todayISO();

  const phases = [...PHASES, "Lainnya"] as string[];
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold md:text-2xl">Checklist persiapan</h1>
        <p className="text-sm text-stone-500">{done} dari {tasks.length} tugas selesai</p>
      </header>

      <form action={addTask} className={card + " grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]"}>
        <input className={input} name="title" placeholder="Tambah tugas baru…" required />
        <select className={input} name="phase" defaultValue="Lainnya">
          {phases.map((p) => <option key={p}>{p}</option>)}
        </select>
        <input className={input} type="date" name="due_date" />
        <input className={input} name="assignee" placeholder="PIC (opsional)" />
        <button className={btn}>Tambah</button>
      </form>

      {phases.map((phase) => {
        const items = tasks.filter((t) => t.phase === phase);
        if (items.length === 0) return null;
        const phaseDone = items.filter((t) => t.status === "done").length;
        return (
          <section key={phase} className={card}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{phase} sebelum akad</h2>
              <span className="text-xs text-stone-500">{phaseDone}/{items.length}</span>
            </div>
            <ul className="divide-y divide-stone-100">
              {items.map((t) => {
                const isDone = t.status === "done";
                const late = !isDone && t.due_date && t.due_date < today;
                return (
                  <li key={t.id} className="flex items-start gap-3 py-3 md:items-center md:py-2">
                    <form action={toggleTask.bind(null, t.id, t.status)}>
                      <button
                        aria-label="Tandai selesai"
                        className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-md border text-sm transition active:scale-90 md:mt-0 md:h-5 md:w-5 md:text-xs ${
                          isDone ? "border-rose-600 btn-liquid" : "border-stone-300 bg-white"
                        }`}
                      >
                        {isDone ? "✓" : ""}
                      </button>
                    </form>
                    <div className="min-w-0 flex-1 md:flex md:items-center md:gap-3">
                      <p className={`text-sm md:flex-1 ${isDone ? "text-stone-400 line-through" : ""}`}>{t.title}</p>
                      <div className="mt-1 flex items-center gap-2 md:mt-0">
                        <span className={`text-xs md:order-2 md:w-24 md:text-right ${late ? "font-medium text-red-600" : "text-stone-500"}`}>
                          {late ? "⚠️ " : "📅 "}{formatDate(t.due_date)}
                        </span>
                        <form action={updateAssignee.bind(null, t.id)} className="md:order-1">
                          <input
                            name="assignee"
                            defaultValue={t.assignee ?? ""}
                            placeholder="+ PIC"
                            className="w-24 rounded border border-transparent bg-transparent px-1.5 py-0.5 text-xs text-stone-600 hover:border-stone-200 focus:border-rose-300 focus:outline-none"
                          />
                        </form>
                      </div>
                    </div>
                    <form action={deleteTask.bind(null, t.id)}>
                      <button className={btnDanger} aria-label="Hapus">✕</button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
