"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/origin";

function creds(fd: FormData) {
  return {
    email: String(fd.get("email") ?? "").trim(),
    password: String(fd.get("password") ?? ""),
  };
}

/** hanya izinkan redirect internal */
function safeNext(fd: FormData) {
  const next = String(fd.get("next") ?? "");
  return next.startsWith("/") && !next.startsWith("//") ? next : "";
}

function back(msg: string, next: string, mode: "masuk" | "daftar") {
  const qs = new URLSearchParams({ message: msg, mode });
  if (next) qs.set("next", next);
  return `/login?${qs.toString()}`;
}

export async function login(fd: FormData) {
  const supabase = await createClient();
  const next = safeNext(fd);
  const { error } = await supabase.auth.signInWithPassword(creds(fd));
  if (error) {
    const msg = error.message.toLowerCase().includes("not confirmed")
      ? "Email belum dikonfirmasi. Cek inbox/spam kamu."
      : "Email atau password salah.";
    redirect(back(msg, next, "masuk"));
  }
  redirect(next || "/dashboard");
}

export async function signup(fd: FormData) {
  const supabase = await createClient();
  const next = safeNext(fd);
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    ...creds(fd),
    options: { emailRedirectTo: `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}` },
  });
  if (error) {
    const msg = error.message.toLowerCase().includes("already registered")
      ? "Email ini sudah terdaftar, silakan masuk."
      : error.message;
    redirect(back(msg, next, "daftar"));
  }
  // jika "Confirm email" dimatikan di Supabase → langsung login
  if (data.session) redirect(next || "/onboarding");
  redirect(back("Akun dibuat! Cek email untuk konfirmasi, lalu masuk.", next, "masuk"));
}
