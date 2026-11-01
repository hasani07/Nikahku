"use server";

import { revalidatePath } from "next/cache";
import { requireWedding } from "@/lib/wedding";

export async function saveDocument(id: string, fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const update: { status: string; file_path?: string } = {
    status: String(fd.get("status") || "belum"),
  };

  const file = fd.get("file");
  if (file instanceof File && file.size > 0) {
    const safeName = file.name.replace(/[^\w.\-]/g, "_");
    const path = `${wedding.id}/${id}-${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("documents").upload(path, file, {
      contentType: file.type || undefined,
      upsert: true,
    });
    if (!error) {
      update.file_path = path;
      if (update.status === "belum") update.status = "proses";
    }
  }

  await supabase.from("documents").update(update).eq("id", id);
  revalidatePath("/documents");
  revalidatePath("/dashboard");
}

export async function addDocument(fd: FormData) {
  const { supabase, wedding } = await requireWedding();
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return;
  await supabase.from("documents").insert({
    wedding_id: wedding.id,
    name,
    owner_side: String(fd.get("owner_side") || "bersama"),
    sort_order: 999,
  });
  revalidatePath("/documents");
}

export async function deleteDocument(id: string) {
  const { supabase } = await requireWedding();
  await supabase.from("documents").delete().eq("id", id);
  revalidatePath("/documents");
}
