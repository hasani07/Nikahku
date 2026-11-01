"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWedding } from "@/lib/wedding";
import { parseNumber } from "@/lib/format";

export async function updateWedding(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  await supabase
    .from("weddings")
    .update({
      groom_name: String(fd.get("groom_name")).trim(),
      bride_name: String(fd.get("bride_name")).trim(),
      wedding_date: String(fd.get("wedding_date")),
      city: String(fd.get("city") || "") || null,
      estimated_guests: parseNumber(fd.get("estimated_guests")) || null,
    })
    .eq("id", wedding.id);
  revalidatePath("/", "layout");
  redirect("/settings?saved=1");
}

/** Geser semua tenggat checklist yang belum selesai mengikuti tanggal baru */
export async function shiftDeadlines(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const days = Number(fd.get("days")) || 0;
  if (!days) return;
  const { data } = await supabase
    .from("tasks")
    .select("id, due_date")
    .eq("wedding_id", wedding.id)
    .neq("status", "done")
    .not("due_date", "is", null);
  await Promise.all(
    (data ?? []).map((t: { id: string; due_date: string }) => {
      const d = new Date(t.due_date + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + days);
      return supabase.from("tasks").update({ due_date: d.toISOString().slice(0, 10) }).eq("id", t.id);
    })
  );
  revalidatePath("/checklist");
  redirect("/settings?saved=1");
}

export async function createInvite(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  await supabase.from("wedding_invites").insert({
    wedding_id: wedding.id,
    role: String(fd.get("role") || "partner"),
  });
  revalidatePath("/settings");
}

export async function deleteInvite(token: string) {
  const { supabase } = await requireWedding();
  await supabase.from("wedding_invites").delete().eq("token", token);
  revalidatePath("/settings");
}

export async function removeMember(userId: string) {
  const { supabase, wedding } = await requireWedding();
  await supabase.from("wedding_members").delete().eq("wedding_id", wedding.id).eq("user_id", userId);
  revalidatePath("/settings");
}
