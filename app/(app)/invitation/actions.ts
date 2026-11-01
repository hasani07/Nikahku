"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWedding } from "@/lib/wedding";
import type { Invitation } from "@/lib/types";

const TEXT_FIELDS = [
  "groom_full", "groom_parents", "bride_full", "bride_parents",
  "opening", "quote", "story",
  "akad_time", "akad_place", "akad_address",
  "resepsi_date", "resepsi_time", "resepsi_place", "resepsi_address",
  "maps_url", "gift_info",
] as const;

export async function saveInvitation(fd: FormData) {
  const { supabase, wedding } = await requireWedding();

  const slug = String(fd.get("slug") ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length < 3) redirect("/invitation?error=" + encodeURIComponent("Alamat link minimal 3 karakter (huruf, angka, -)."));

  const inv: Invitation = { ...(wedding.invitation ?? {}) };
  for (const k of TEXT_FIELDS) {
    const v = String(fd.get(k) ?? "").trim();
    inv[k] = v || undefined;
  }
  inv.theme = (String(fd.get("theme") || "rose") as Invitation["theme"]);
  inv.published = fd.get("published") === "on";

  const cover = fd.get("cover");
  if (cover instanceof File && cover.size > 0) {
    const ext = (cover.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${wedding.id}/cover-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("public-assets").upload(path, cover, {
      contentType: cover.type || undefined,
      upsert: true,
    });
    if (!error) {
      inv.cover_url = supabase.storage.from("public-assets").getPublicUrl(path).data.publicUrl;
    }
  }
  if (fd.get("remove_cover") === "on") inv.cover_url = undefined;

  const { error } = await supabase.from("weddings").update({ slug, invitation: inv }).eq("id", wedding.id);
  if (error) {
    const msg = error.code === "23505" ? "Alamat link sudah dipakai pasangan lain, coba yang lain." : error.message;
    redirect("/invitation?error=" + encodeURIComponent(msg));
  }

  revalidatePath("/invitation");
  revalidatePath(`/u/${slug}`);
  redirect("/invitation?saved=1");
}
