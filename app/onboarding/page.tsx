import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createWedding } from "./actions";
import { btn, card, input, label } from "@/lib/ui";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("weddings").select("id").limit(1).maybeSingle();
  if (existing) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-bold">Ceritakan rencana pernikahanmu 💍</h1>
      <p className="mb-6 text-stone-600">
        Dari data ini kami susunkan checklist, budget, dan daftar dokumen secara otomatis.
      </p>

      <form action={createWedding} className={card + " grid gap-4 md:grid-cols-2"}>
        <div>
          <label className={label}>Nama calon pengantin pria</label>
          <input className={input} name="groom_name" required />
        </div>
        <div>
          <label className={label}>Nama calon pengantin wanita</label>
          <input className={input} name="bride_name" required />
        </div>
        <div>
          <label className={label}>Target tanggal akad</label>
          <input className={input} name="wedding_date" type="date" required />
        </div>
        <div>
          <label className={label}>Kota acara</label>
          <input className={input} name="city" placeholder="Yogyakarta" />
        </div>
        <div>
          <label className={label}>Agama (untuk syarat dokumen)</label>
          <select className={input} name="religion" defaultValue="islam">
            <option value="islam">Islam (KUA)</option>
            <option value="kristen">Kristen</option>
            <option value="katolik">Katolik</option>
            <option value="hindu">Hindu</option>
            <option value="buddha">Buddha</option>
            <option value="konghucu">Konghucu</option>
          </select>
        </div>
        <div>
          <label className={label}>Konsep acara</label>
          <select className={input} name="concept" defaultValue="modern">
            <option value="adat">Adat</option>
            <option value="modern">Modern</option>
            <option value="intimate">Intimate</option>
          </select>
        </div>
        <div>
          <label className={label}>Perkiraan jumlah tamu</label>
          <input className={input} name="estimated_guests" inputMode="numeric" placeholder="300" />
        </div>
        <div>
          <label className={label}>Total budget (Rp)</label>
          <input className={input} name="total_budget" inputMode="numeric" placeholder="80.000.000" required />
        </div>
        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
        <button className={btn + " md:col-span-2"}>Buat rencana pernikahan</button>
      </form>
    </main>
  );
}
