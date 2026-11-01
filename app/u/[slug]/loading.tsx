import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-rose-50">
      <Spinner size={48} />
      <p className="text-sm tracking-widest text-rose-700/70">MEMBUKA UNDANGAN…</p>
    </main>
  );
}
