export default function Spinner({ size = 28 }: { size?: number }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }} role="status" aria-label="Memuat">
      <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-rose-100 border-t-rose-500" />
      <span className="absolute inset-0 flex items-center justify-center text-[0.55em]" style={{ fontSize: size * 0.45 }}>💍</span>
    </span>
  );
}
