import Link from "next/link";
import { login, signup } from "./actions";
import { btn, card, input, label } from "@/lib/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string; mode?: string }>;
}) {
  const { message, next = "", mode } = await searchParams;
  const isSignup = mode === "daftar";
  const qs = (m: string) => `/login?mode=${m}${next ? `&next=${encodeURIComponent(next)}` : ""}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <Link href="/" className="mb-6 text-center text-xl font-semibold text-rose-700">💍 NikahKu</Link>

      <div className={card + " space-y-4"}>
        <div className="grid grid-cols-2 rounded-lg bg-stone-100 p-1 text-sm">
          <Link href={qs("masuk")} className={`rounded-md py-2 text-center ${!isSignup ? "bg-white font-medium shadow-sm" : "text-stone-500"}`}>Masuk</Link>
          <Link href={qs("daftar")} className={`rounded-md py-2 text-center ${isSignup ? "bg-white font-medium shadow-sm" : "text-stone-500"}`}>Daftar</Link>
        </div>

        <form action={isSignup ? signup : login} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label className={label} htmlFor="email">Email</label>
            <input className={input} id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div>
            <label className={label} htmlFor="password">Password {isSignup && <span className="font-normal text-stone-400">(min. 6 karakter)</span>}</label>
            <input className={input} id="password" name="password" type="password" minLength={6}
                   autoComplete={isSignup ? "new-password" : "current-password"} required />
          </div>
          {message && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{message}</p>}
          <button className={btn + " w-full py-2.5"}>{isSignup ? "Buat akun" : "Masuk"}</button>
        </form>

        <p className="text-center text-xs text-stone-500">
          {isSignup ? "Sudah punya akun? " : "Belum punya akun? "}
          <Link href={qs(isSignup ? "masuk" : "daftar")} className="text-rose-600 hover:underline">
            {isSignup ? "Masuk" : "Daftar gratis"}
          </Link>
        </p>
      </div>
    </main>
  );
}
