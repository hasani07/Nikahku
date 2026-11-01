import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { btn, card } from "@/lib/ui";

async function accept(token: string) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_invite", { p_token: token });
  if (error) redirect(`/join/${token}?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/join/${token}`)}`);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <div className={card + " space-y-4 text-center"}>
        <p className="text-4xl">💍</p>
        <h1 className="text-xl font-semibold">Kamu diundang bergabung</h1>
        <p className="text-sm text-stone-600">
          Bergabung ke rencana pernikahan di NikahKu sebagai <b>{user.email}</b> untuk ikut mengelola checklist, budget, tamu, dan lainnya.
        </p>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <form action={accept.bind(null, token)}>
          <button className={btn + " w-full"}>Gabung sekarang</button>
        </form>
      </div>
    </main>
  );
}
