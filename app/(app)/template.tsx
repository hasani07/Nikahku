// template = di-mount ulang setiap pindah halaman → animasi masuk yang halus
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
