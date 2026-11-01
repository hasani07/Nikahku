import Link from "next/link";
import { login, signup } from "./actions";
import { btn, btnGhost, card, input, label } from "@/lib/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const { message, next = "" } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <Link href="/" className="mb-6 text-center text-xl font-semibold text-rose-700">💍 NikahKu</Link>
      <form className={card + " space-y-4"}>
        <input type="hidden" name="next" value={next} />
        <div>
          <label className={label} htmlFor="email">Email</label>
          <input className={input} id="email" name="email" type="email" required />
        </div>
        <div>
          <label className={label} htmlFor="password">Password</label>
          <input className={input} id="password" name="password" type="password" minLength={6} required />
        </div>
        {message && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{message}</p>}
        <button formAction={login} className={btn + " w-full"}>Masuk</button>
        <button formAction={signup} className={btnGhost + " w-full py-2"}>Daftar akun baru</button>
      </form>
    </main>
  );
}
