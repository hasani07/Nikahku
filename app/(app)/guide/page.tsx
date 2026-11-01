import Link from "next/link";
import { card } from "@/lib/ui";
import { BUDGET_TEMPLATES } from "@/lib/templates";

const SECTIONS: { title: string; icon: string; points: string[] }[] = [
  {
    icon: "💰",
    title: "Menentukan budget yang realistis",
    points: [
      "Mulai dari jumlah tamu — ini penentu biaya terbesar (venue & catering ±45%).",
      "Sepakati dengan kedua keluarga siapa menanggung apa sebelum booking vendor.",
      "Sisihkan 5–10% dana darurat untuk biaya tak terduga.",
      "Bagi target tabungan per bulan sampai hari H, lalu setor rutin di menu Tabungan.",
      "Pikirkan juga biaya setelah menikah (tempat tinggal, kebutuhan awal) — jangan habis semua untuk pesta.",
    ],
  },
  {
    icon: "🤝",
    title: "Memilih vendor",
    points: [
      "Survei minimal 2–3 vendor per kategori dan catat di menu Vendor untuk dibandingkan.",
      "Tanyakan: apa saja yang termasuk paket, berapa DP & jadwal pelunasan, kebijakan pembatalan / ganti tanggal.",
      "Untuk catering: minta test food, tanyakan jumlah porsi cadangan & sistem prasmanan/gubukan.",
      "Minta kontrak/kuitansi tertulis untuk setiap pembayaran.",
      "Cek ulasan dan portofolio asli (Instagram, Google Maps), bukan hanya katalog.",
    ],
  },
  {
    icon: "📄",
    title: "Mengurus dokumen nikah",
    points: [
      "Muslim: daftar ke KUA kecamatan tempat akad, minimal 10 hari kerja sebelum hari H.",
      "Mulai dari surat pengantar RT/RW → kelurahan (formulir N1 dst).",
      "Bila akad di luar kecamatan domisili, minta surat rekomendasi nikah dari KUA asal.",
      "Non-muslim: pemberkatan di lembaga agama, lalu pencatatan perkawinan di Dukcapil.",
      "Syarat bisa berbeda tiap daerah — selalu konfirmasi ke kantor setempat.",
    ],
  },
  {
    icon: "🎁",
    title: "Mahar & seserahan",
    points: [
      "Mahar disepakati bersama; bisa berupa uang, emas, perhiasan, atau seperangkat alat ibadah.",
      "Isi seserahan umum: perlengkapan ibadah, pakaian, sepatu/sandal, tas, kosmetik & skincare, perhiasan, makanan/kue tradisional.",
      "Tanyakan selera & ukuran calon pasangan agar barang terpakai.",
    ],
  },
  {
    icon: "🌸",
    title: "Rangkaian adat populer",
    points: [
      "Jawa: siraman, midodareni, ijab, panggih (balangan gantal, wiji dadi, sindur), sungkeman.",
      "Sunda: neundeun omong, siraman, ngeuyeuk seureuh, sawer, nincak endog, huap lingkung.",
      "Minang: maminang, batimbang tando, malam bainai, akad, basandiang.",
      "Batak: marhusip, martumpol, martonggo raja, pemberkatan, ulaon unjuk.",
      "Diskusikan dengan sesepuh keluarga mana yang ingin dipertahankan agar budget & waktu sesuai.",
    ],
  },
  {
    icon: "💬",
    title: "Persiapan sebagai pasangan",
    points: [
      "Bicarakan keuangan setelah menikah: penghasilan, tabungan, utang, pembagian pengeluaran.",
      "Sepakati tempat tinggal, rencana karier, dan rencana memiliki anak.",
      "Ikuti bimbingan perkawinan / kursus pranikah dan lakukan cek kesehatan bersama.",
      "Saat persiapan memanas, ingat: tujuannya pernikahan, bukan sekadar pesta.",
    ],
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Panduan persiapan nikah</h1>
        <p className="text-sm text-stone-500">Ringkasan praktis. Timeline lengkap ada di <Link href="/checklist" className="text-rose-600">Checklist</Link>.</p>
      </header>

      {SECTIONS.map((s) => (
        <section key={s.title} className={card}>
          <h2 className="mb-3 font-semibold">{s.icon} {s.title}</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-stone-700">
            {s.points.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </section>
      ))}

      <section className={card}>
        <h2 className="mb-3 font-semibold">📊 Patokan pembagian budget</h2>
        <ul className="grid gap-1 text-sm md:grid-cols-2">
          {BUDGET_TEMPLATES.map((b) => (
            <li key={b.name} className="flex justify-between border-b border-stone-100 py-1">
              <span>{b.name}</span><span className="text-stone-500">{b.pct}%</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
