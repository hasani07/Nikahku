"use server";

import { revalidatePath } from "next/cache";
import { requireWedding } from "@/lib/wedding";
import { parseNumber } from "@/lib/format";

export async function addGift(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const from_name = String(fd.get("from_name") ?? "").trim();
  if (!from_name) return;
  await supabase.from("gifts").insert({
    wedding_id: wedding.id,
    from_name,
    kind: String(fd.get("kind") || "amplop"),
    amount: parseNumber(fd.get("amount")) || null,
    note: String(fd.get("note") || "") || null,
  });
  revalidatePath("/gifts");
}

export async function toggleThanked(id: string, thanked: boolean) {
  const { supabase } = await requireWedding();
  await supabase.from("gifts").update({ thanked: !thanked }).eq("id", id);
  revalidatePath("/gifts");
}

export async function deleteGift(id: string) {
  const { supabase } = await requireWedding();
  await supabase.from("gifts").delete().eq("id", id);
  revalidatePath("/gifts");
}
