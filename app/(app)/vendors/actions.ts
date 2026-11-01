"use server";

import { revalidatePath } from "next/cache";
import { requireWedding } from "@/lib/wedding";
import { parseNumber, todayISO } from "@/lib/format";

function refresh() {
  revalidatePath("/vendors");
  revalidatePath("/budget");
  revalidatePath("/dashboard");
}

export async function addVendor(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return;
  await supabase.from("vendors").insert({
    wedding_id: wedding.id,
    name,
    category_id: String(fd.get("category_id") || "") || null,
    service: String(fd.get("service") || "") || null,
    contact_name: String(fd.get("contact_name") || "") || null,
    phone: String(fd.get("phone") || "") || null,
    instagram: String(fd.get("instagram") || "").replace(/^@/, "") || null,
    price_quote: parseNumber(fd.get("price_quote")),
    note: String(fd.get("note") || "") || null,
  });
  refresh();
}

export async function updateVendor(id: string, fd: FormData) {
  const { supabase } = await requireWedding();
  const rating = Number(fd.get("rating")) || null;
  await supabase
    .from("vendors")
    .update({
      status: String(fd.get("status") || "survei"),
      price_quote: parseNumber(fd.get("price_quote")),
      rating,
    })
    .eq("id", id);
  refresh();
}

export async function payVendor(id: string, categoryId: string | null, vendorName: string, fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const amount = parseNumber(fd.get("amount"));
  if (!amount) return;
  const type = String(fd.get("type") || "dp");
  await supabase.from("expenses").insert({
    wedding_id: wedding.id,
    vendor_id: id,
    category_id: categoryId,
    title: `${type.toUpperCase()} ${vendorName}`,
    amount,
    type,
    paid_at: todayISO(),
  });
  await supabase
    .from("vendors")
    .update({ status: type === "lunas" ? "lunas" : "booking" })
    .eq("id", id)
    .in("status", ["survei", "nego", "booking"]);
  refresh();
}

export async function deleteVendor(id: string) {
  const { supabase } = await requireWedding();
  await supabase.from("vendors").delete().eq("id", id);
  refresh();
}
