"use server";

import { revalidatePath } from "next/cache";
import { requireWedding } from "@/lib/wedding";
import { parseNumber } from "@/lib/format";

export async function addSaving(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const amount = parseNumber(fd.get("amount"));
  if (!amount) return;
  await supabase.from("savings").insert({
    wedding_id: wedding.id,
    amount,
    saved_at: String(fd.get("saved_at") || "") || undefined,
    by_whom: String(fd.get("by_whom") || "") || null,
    note: String(fd.get("note") || "") || null,
  });
  revalidatePath("/savings");
  revalidatePath("/dashboard");
}

export async function deleteSaving(id: string) {
  const { supabase } = await requireWedding();
  await supabase.from("savings").delete().eq("id", id);
  revalidatePath("/savings");
  revalidatePath("/dashboard");
}
