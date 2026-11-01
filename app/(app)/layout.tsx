import { requireWedding } from "@/lib/wedding";
import { daysUntil } from "@/lib/format";
import AppNav from "@/components/AppNav";
import { signOut } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { wedding } = await requireWedding();

  return (
    <div className="min-h-screen md:flex">
      <AppNav
        couple={`${wedding.groom_name} & ${wedding.bride_name}`}
        daysLeft={daysUntil(wedding.wedding_date)}
        signOut={signOut}
      />
      <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-3 pb-32 pt-4 md:px-6 md:pb-10 md:pt-6">
        {children}
      </main>
    </div>
  );
}
