"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function submitRsvp(slug: string, code: string, to: string, fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_rsvp", {
    p_slug: slug,
    p_code: code,
    p_name: String(fd.get("name") ?? "").trim(),
    p_attendance: String(fd.get("attendance") ?? "hadir"),
    p_pax: Number(fd.get("pax")) || 1,
    p_message: String(fd.get("message") ?? "").trim(),
  });
  const qs = new URLSearchParams();
  if (to) qs.set("to", to);
  if (code) qs.set("c", code);
  qs.set(error ? "err" : "sent", "1");
  redirect(`/u/${slug}?${qs.toString()}#rsvp`);
}
