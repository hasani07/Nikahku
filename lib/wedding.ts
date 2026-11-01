import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/types";

/** Ambil user + wedding aktif. Redirect ke /login atau /onboarding bila belum ada. */
export async function requireWedding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("weddings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data) redirect("/onboarding");
  return { supabase, user, wedding: data as Wedding };
}
