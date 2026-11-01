import { requireWedding } from "@/lib/wedding";
import { btn, btnDanger, btnGhost, card, input } from "@/lib/ui";
import type { Doc } from "@/lib/types";
import { addDocument, deleteDocument, saveDocument } from "./actions";

const SIDES = [
  ["pria", "Calon pengantin pria"],
  ["wanita", "Calon pengantin wanita"],
  ["bersama", "Bersama"],
] as const;

const STATUS_STYLE = {
  belum: "bg-stone-100 text-stone-600",
  proses: "bg-amber-50 text-amber-700",
  selesai: "bg-emerald-50 text-emerald-700",
} as const;

export default async function DocumentsPage() {
  const { supabase, wedding } = await requireWedding();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("sort_order");
  const docs = (data ?? []) as Doc[];

  // link sementara (1 jam) untuk file yang sudah diupload
  const paths = docs.map((d) => d.file_path).filter((p): p is string => !!p);
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data: signed } = await supabase.storage.from("documents").createSignedUrls(paths, 3600);
    signed?.forEach((s) => s.path && s.signedUrl && urls.set(s.path, s.signedUrl));
  }

  const done = docs.filter((d) => d.status === "selesai").length;
  const office = wedding.religion === "islam" ? "KUA" : "Dukcapil & lembaga agama";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold md:text-2xl">Dokumen nikah</h1>
        <p className="text-sm text-stone-500">
          {done} dari {docs.length} selesai · syarat bisa berbeda tiap daerah, cek ulang ke {office} setempat.
        </p>
      </header>

      {SIDES.map(([side, title]) => {
        const items = docs.filter((d) => d.owner_side === side);
        if (!items.length) return null;
        return (
          <section key={side} className={card}>
            <h2 className="mb-3 font-semibold">{title}</h2>
            <ul className="divide-y divide-stone-100">
              {items.map((d) => (
                <li key={d.id} className="py-3">
                  <form action={saveDocument.bind(null, d.id)} className="flex flex-wrap items-center gap-2">
                    <span className="min-w-[14rem] flex-1 text-sm">{d.name}</span>
                    <span className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                    {d.file_path && urls.get(d.file_path) && (
                      <a href={urls.get(d.file_path)} target="_blank" className="text-xs text-rose-600 hover:underline">
                        Lihat file
                      </a>
                    )}
                    <select name="status" defaultValue={d.status} className="rounded border border-stone-200 px-2 py-1 text-xs">
                      <option value="belum">Belum</option>
                      <option value="proses">Proses</option>
                      <option value="selesai">Selesai</option>
                    </select>
                    <input type="file" name="file" accept="image/*,application/pdf" className="max-w-[12rem] text-xs" />
                    <button className={btnGhost + " text-xs"}>Simpan</button>
                  </form>
                  <form action={deleteDocument.bind(null, d.id)} className="mt-1 text-right">
                    <button className={btnDanger}>hapus</button>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <form action={addDocument} className={card + " flex flex-wrap gap-2"}>
        <input className={input + " flex-1"} name="name" placeholder="Tambah dokumen lain (mis. izin atasan)" required />
        <select className={input + " max-w-[12rem]"} name="owner_side" defaultValue="bersama">
          {SIDES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>
        <button className={btn}>Tambah</button>
      </form>
    </div>
  );
}
