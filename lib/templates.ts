import type { Religion } from "@/lib/types";

export const PHASES = [
  "12–9 bulan",
  "9–6 bulan",
  "6–3 bulan",
  "3–1 bulan",
  "1 bulan – 1 minggu",
  "Hari H & setelahnya",
] as const;

type TaskTpl = {
  title: string;
  phase: (typeof PHASES)[number];
  monthsBefore: number; // negatif = setelah hari H
  only?: "islam" | "non-islam";
};

export const TASK_TEMPLATES: TaskTpl[] = [
  // 12–9 bulan
  { phase: "12–9 bulan", monthsBefore: 12, title: "Diskusi visi pernikahan & konsep acara bersama pasangan" },
  { phase: "12–9 bulan", monthsBefore: 11.5, title: "Musyawarah kedua keluarga: tanggal, adat, pembagian biaya" },
  { phase: "12–9 bulan", monthsBefore: 11.5, title: "Tentukan total budget & mulai tabungan nikah rutin" },
  { phase: "12–9 bulan", monthsBefore: 11, title: "Tentukan perkiraan jumlah tamu" },
  { phase: "12–9 bulan", monthsBefore: 10.5, title: "Survei & booking venue / gedung" },
  { phase: "12–9 bulan", monthsBefore: 10, title: "Survei, test food & booking catering" },
  { phase: "12–9 bulan", monthsBefore: 9.5, title: "Kunci tanggal akad & resepsi" },

  // 9–6 bulan
  { phase: "9–6 bulan", monthsBefore: 8.5, title: "Acara lamaran / khitbah" },
  { phase: "9–6 bulan", monthsBefore: 8, title: "Pilih & booking WO/EO (jika pakai)" },
  { phase: "9–6 bulan", monthsBefore: 8, title: "Booking dekorasi" },
  { phase: "9–6 bulan", monthsBefore: 7.5, title: "Booking MUA & busana pengantin" },
  { phase: "9–6 bulan", monthsBefore: 7.5, title: "Booking fotografer & videografer" },
  { phase: "9–6 bulan", monthsBefore: 7, title: "Susun daftar tamu sementara" },
  { phase: "9–6 bulan", monthsBefore: 6.5, title: "Tentukan seragam keluarga & susunan panitia" },

  // 6–3 bulan
  { phase: "6–3 bulan", monthsBefore: 5.5, title: "Foto prewedding (opsional)" },
  { phase: "6–3 bulan", monthsBefore: 5.5, title: "Booking MC & hiburan" },
  { phase: "6–3 bulan", monthsBefore: 5, title: "Pesan undangan (cetak / digital)" },
  { phase: "6–3 bulan", monthsBefore: 5, title: "Pesan souvenir" },
  { phase: "6–3 bulan", monthsBefore: 4.5, title: "Siapkan mahar" },
  { phase: "6–3 bulan", monthsBefore: 4, title: "Siapkan seserahan" },
  { phase: "6–3 bulan", monthsBefore: 4, title: "Pesan cincin nikah" },
  { phase: "6–3 bulan", monthsBefore: 4, title: "Ikut Bimbingan Perkawinan (Bimwin) Kemenag", only: "islam" },
  { phase: "6–3 bulan", monthsBefore: 4, title: "Ikut kursus persiapan perkawinan di lembaga agama", only: "non-islam" },
  { phase: "6–3 bulan", monthsBefore: 3.5, title: "Pemeriksaan kesehatan pranikah" },
  { phase: "6–3 bulan", monthsBefore: 3, title: "Rencanakan tempat tinggal & keuangan setelah menikah" },

  // 3–1 bulan
  { phase: "3–1 bulan", monthsBefore: 2.5, title: "Urus surat pengantar RT/RW & kelurahan" },
  { phase: "3–1 bulan", monthsBefore: 2, title: "Daftar nikah ke KUA (min. 10 hari kerja sebelum akad)", only: "islam" },
  { phase: "3–1 bulan", monthsBefore: 2, title: "Daftar pemberkatan & pencatatan sipil (Dukcapil)", only: "non-islam" },
  { phase: "3–1 bulan", monthsBefore: 1.5, title: "Sebar undangan" },
  { phase: "3–1 bulan", monthsBefore: 1.5, title: "Fitting busana & test makeup" },
  { phase: "3–1 bulan", monthsBefore: 1, title: "Final menu & jumlah porsi catering" },
  { phase: "3–1 bulan", monthsBefore: 1, title: "Susun rundown akad & resepsi" },
  { phase: "3–1 bulan", monthsBefore: 1, title: "Bagi tugas panitia keluarga" },

  // 1 bulan – 1 minggu
  { phase: "1 bulan – 1 minggu", monthsBefore: 0.5, title: "Rekap RSVP & kirim jumlah final ke catering" },
  { phase: "1 bulan – 1 minggu", monthsBefore: 0.5, title: "Technical meeting dengan WO & vendor" },
  { phase: "1 bulan – 1 minggu", monthsBefore: 0.4, title: "Pelunasan vendor sesuai jadwal" },
  { phase: "1 bulan – 1 minggu", monthsBefore: 0.25, title: "Konfirmasi ulang semua vendor" },
  { phase: "1 bulan – 1 minggu", monthsBefore: 0.1, title: "Gladi resik / latihan ijab kabul", only: "islam" },
  { phase: "1 bulan – 1 minggu", monthsBefore: 0.1, title: "Gladi resik pemberkatan", only: "non-islam" },
  { phase: "1 bulan – 1 minggu", monthsBefore: 0.1, title: "Siapkan barang bawaan hari H" },

  // Hari H & setelahnya
  { phase: "Hari H & setelahnya", monthsBefore: 0, title: "Hari H: akad & resepsi 🎉" },
  { phase: "Hari H & setelahnya", monthsBefore: -0.25, title: "Rekap amplop & hadiah" },
  { phase: "Hari H & setelahnya", monthsBefore: -0.25, title: "Ucapan terima kasih ke keluarga, panitia & tamu" },
  { phase: "Hari H & setelahnya", monthsBefore: -0.5, title: "Pelunasan sisa vendor & ambil hasil foto/video" },
  { phase: "Hari H & setelahnya", monthsBefore: -0.5, title: "Ambil buku nikah / akta perkawinan" },
];

export const BUDGET_TEMPLATES: { name: string; pct: number }[] = [
  { name: "Venue & Catering", pct: 45 },
  { name: "Dekorasi", pct: 9 },
  { name: "Busana & MUA", pct: 9 },
  { name: "Foto & Video", pct: 8 },
  { name: "Mahar, Seserahan & Cincin", pct: 6 },
  { name: "Undangan & Souvenir", pct: 5 },
  { name: "Hiburan & MC", pct: 4 },
  { name: "WO / EO", pct: 4 },
  { name: "Lamaran", pct: 3 },
  { name: "Administrasi & Dokumen", pct: 1 },
  { name: "Dana Darurat", pct: 6 },
];

const DOCS_ISLAM_PERSON = [
  "Fotokopi KTP",
  "Fotokopi Kartu Keluarga",
  "Fotokopi akta kelahiran",
  "Pas foto 2x3 & 4x6 (latar biru)",
  "Surat pengantar nikah dari kelurahan (N1)",
  "Surat izin orang tua (N4)",
  "Sertifikat Bimwin / surat keterangan sehat",
];
const DOCS_ISLAM_SHARED = [
  "Formulir permohonan kehendak nikah (N2)",
  "Surat persetujuan calon mempelai (N3)",
  "Surat rekomendasi nikah (jika akad di luar kecamatan domisili)",
];
const DOCS_OTHER_PERSON = [
  "Fotokopi KTP",
  "Fotokopi Kartu Keluarga",
  "Fotokopi akta kelahiran",
  "Surat baptis / keterangan dari lembaga agama",
  "Pas foto 4x6",
];
const DOCS_OTHER_SHARED = [
  "Surat keterangan pemberkatan dari lembaga agama",
  "Pas foto berdampingan 4x6",
  "Fotokopi KTP 2 orang saksi",
  "Formulir pencatatan perkawinan Dukcapil",
];

function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function buildTasks(weddingId: string, weddingDate: string, religion: Religion) {
  const isIslam = religion === "islam";
  return TASK_TEMPLATES.filter(
    (t) => !t.only || (t.only === "islam" ? isIslam : !isIslam)
  ).map((t, i) => ({
    wedding_id: weddingId,
    title: t.title,
    phase: t.phase,
    due_date: addDays(weddingDate, -Math.round(t.monthsBefore * 30)),
    sort_order: i,
  }));
}

export function buildBudget(weddingId: string, total: number) {
  return BUDGET_TEMPLATES.map((b, i) => ({
    wedding_id: weddingId,
    name: b.name,
    planned_amount: Math.round((total * b.pct) / 100),
    sort_order: i,
  }));
}

export function buildDocs(weddingId: string, religion: Religion) {
  const isIslam = religion === "islam";
  const person = isIslam ? DOCS_ISLAM_PERSON : DOCS_OTHER_PERSON;
  const shared = isIslam ? DOCS_ISLAM_SHARED : DOCS_OTHER_SHARED;
  const rows = [
    ...person.map((name) => ({ owner_side: "pria", name })),
    ...person.map((name) => ({ owner_side: "wanita", name })),
    ...shared.map((name) => ({ owner_side: "bersama", name })),
  ];
  return rows.map((r, i) => ({ ...r, wedding_id: weddingId, sort_order: i }));
}
