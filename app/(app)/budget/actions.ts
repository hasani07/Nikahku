"use server";

import { revalidatePath } from "next/cache";
import { requireWedding } from "@/lib/wedding";
import { parseNumber } from "@/lib/format";

function refresh() {
  revalidatePath("/budget");
  revalidatePath("/dashboard");
}

export async function updateTotalBudget(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  await supabase.from("weddings").update({ total_budget: parseNumber(fd.get("total_budget")) }).eq("id", wedding.id);
  refresh();
}

export async function updatePlanned(id: string, fd: FormData) {
  const { supabase } = await requireWedding();
  await supabase.from("budget_categories").update({ planned_amount: parseNumber(fd.get("planned")) }).eq("id", id);
  refresh();
}

export async function addCategory(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return;
  await supabase.from("budget_categories").insert({
    wedding_id: wedding.id,
    name,
    planned_amount: parseNumber(fd.get("planned")),
    sort_order: 999,
  });
  refresh();
}

export async function addExpense(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const amount = parseNumber(fd.get("amount"));
  if (!amount) return;
  await supabase.from("expenses").insert({
    wedding_id: wedding.id,
    category_id: String(fd.get("category_id") || "") || null,
    vendor_id: String(fd.get("vendor_id") || "") || null,
    title: String(fd.get("title") || "Pembayaran"),
    amount,
    type: String(fd.get("type") || "dp"),
    paid_at: String(fd.get("paid_at") || "") || null,
  });
  refresh();
}

export async function deleteExpense(id: string) {
  const { supabase } = await requireWedding();
  await supabase.from("expenses").delete().eq("id", id);
  refresh();
}
