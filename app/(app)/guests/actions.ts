"use server";

import { revalidatePath } from "next/cache";
import { requireWedding } from "@/lib/wedding";
import { parseNumber } from "@/lib/format";

function refresh() {
  revalidatePath("/guests");
  revalidatePath("/dashboard");
}

export async function addGuest(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return;
  await supabase.from("guests").insert({
    wedding_id: wedding.id,
    name,
    phone: String(fd.get("phone") || "") || null,
    group_name: String(fd.get("group_name") || "") || null,
    pax: parseNumber(fd.get("pax")) || 1,
  });
  refresh();
}

/** Tempel banyak nama sekaligus, satu per baris: "Nama, No HP, Jumlah" */
export async function bulkAddGuests(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const group_name = String(fd.get("group_name") || "") || null;
  const rows = String(fd.get("bulk") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, phone, pax] = line.split(",").map((s) => s.trim());
      return {
        wedding_id: wedding.id,
        name,
        phone: phone || null,
        pax: Number(pax) || 1,
        group_name,
      };
    })
    .filter((r) => r.name);
  if (rows.length) await supabase.from("guests").insert(rows);
  refresh();
}

export async function setRsvp(id: string, fd: FormData) {
  const { supabase } = await requireWedding();
  await supabase.from("guests").update({ rsvp_status: String(fd.get("rsvp_status")) }).eq("id", id);
  refresh();
}

export async function deleteGuest(id: string) {
  const { supabase } = await requireWedding();
  await supabase.from("guests").delete().eq("id", id);
  refresh();
}
