"use server";

import { revalidatePath } from "next/cache";
import { requireWedding } from "@/lib/wedding";

export async function toggleCheckIn(id: string, checkedIn: boolean) {
  const { supabase } = await requireWedding();
  await supabase
    .from("guests")
    .update({ checked_in_at: checkedIn ? null : new Date().toISOString(), ...(checkedIn ? {} : { rsvp_status: "hadir" }) })
    .eq("id", id);
  revalidatePath("/hari-h");
}

/** Tamu yang datang tapi belum ada di daftar */
export async function walkIn(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return;
  await supabase.from("guests").insert({
    wedding_id: wedding.id,
    name,
    pax: Number(fd.get("pax")) || 1,
    group_name: "Lainnya",
    rsvp_status: "hadir",
    checked_in_at: new Date().toISOString(),
  });
  revalidatePath("/hari-h");
}
