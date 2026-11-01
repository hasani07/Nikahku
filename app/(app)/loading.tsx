import Spinner from "@/components/Spinner";

function Bone({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Memuat">
      <div className="flex items-center gap-3">
        <Spinner />
        <span className="text-sm text-stone-500">Memuat…</span>
      </div>
      <Bone className="h-8 w-48" />
      <Bone className="h-28 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <Bone className="h-24" />
        <Bone className="h-24" />
        <Bone className="h-24" />
      </div>
      <Bone className="h-48 w-full" />
    </div>
  );
}
