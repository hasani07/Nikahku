"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseNumber } from "@/lib/format";
import { buildBudget, buildDocs, buildTasks } from "@/lib/templates";
import type { Religion } from "@/lib/types";

export async function createWedding(fd: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const wedding_date = String(fd.get("wedding_date"));
  const religion = String(fd.get("religion") || "islam") as Religion;
  const total_budget = parseNumber(fd.get("total_budget"));

  const { data: wedding, error } = await supabase
    .from("weddings")
    .insert({
      owner_id: user.id,
      groom_name: String(fd.get("groom_name")).trim(),
      bride_name: String(fd.get("bride_name")).trim(),
      wedding_date,
      city: String(fd.get("city") ?? "").trim() || null,
      religion,
      concept: String(fd.get("concept") ?? "") || null,
      estimated_guests: parseNumber(fd.get("estimated_guests")) || null,
      total_budget,
    })
    .select("id")
    .single();

  if (error || !wedding) {
    redirect("/onboarding?error=" + encodeURIComponent(error?.message ?? "Gagal menyimpan"));
  }

  // generate template otomatis berdasarkan tanggal & agama
  await Promise.all([
    supabase.from("tasks").insert(buildTasks(wedding.id, wedding_date, religion)),
    supabase.from("budget_categories").insert(buildBudget(wedding.id, total_budget)),
    supabase.from("documents").insert(buildDocs(wedding.id, religion)),
  ]);

  redirect("/dashboard");
}
