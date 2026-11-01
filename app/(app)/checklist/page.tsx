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
        <h1 className="text-2xl font-bold">Checklist persiapan</h1>
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
                  <li key={t.id} className="flex flex-wrap items-center gap-3 py-2">
                    <form action={toggleTask.bind(null, t.id, t.status)}>
                      <button
                        aria-label="Tandai selesai"
                        className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                          isDone ? "border-rose-600 bg-rose-600 text-white" : "border-stone-300 bg-white"
                        }`}
                      >
                        {isDone ? "✓" : ""}
                      </button>
                    </form>
                    <span className={`flex-1 text-sm ${isDone ? "text-stone-400 line-through" : ""}`}>{t.title}</span>
                    <form action={updateAssignee.bind(null, t.id)} className="flex items-center gap-1">
                      <input
                        name="assignee"
                        defaultValue={t.assignee ?? ""}
                        placeholder="PIC"
                        className="w-24 rounded border border-transparent px-2 py-1 text-xs hover:border-stone-200 focus:border-rose-300 focus:outline-none"
                      />
                    </form>
                    <span className={`w-24 text-right text-xs ${late ? "font-medium text-red-600" : "text-stone-500"}`}>
                      {formatDate(t.due_date)}
                    </span>
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
