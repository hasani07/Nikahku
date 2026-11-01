"use server";

import { revalidatePath } from "next/cache";
import { requireWedding } from "@/lib/wedding";

export async function toggleTask(id: string, status: string) {
  const { supabase } = await requireWedding();
  await supabase.from("tasks").update({ status: status === "done" ? "todo" : "done" }).eq("id", id);
  revalidatePath("/checklist");
  revalidatePath("/dashboard");
}

export async function addTask(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const title = String(fd.get("title") ?? "").trim();
  if (!title) return;
  await supabase.from("tasks").insert({
    wedding_id: wedding.id,
    title,
    phase: String(fd.get("phase") || "Lainnya"),
    due_date: String(fd.get("due_date") || "") || null,
    assignee: String(fd.get("assignee") || "") || null,
    sort_order: 999,
  });
  revalidatePath("/checklist");
}

export async function updateAssignee(id: string, fd: FormData) {
  const { supabase } = await requireWedding();
  await supabase.from("tasks").update({ assignee: String(fd.get("assignee") || "") || null }).eq("id", id);
  revalidatePath("/checklist");
}

export async function deleteTask(id: string) {
  const { supabase } = await requireWedding();
  await supabase.from("tasks").delete().eq("id", id);
  revalidatePath("/checklist");
}
