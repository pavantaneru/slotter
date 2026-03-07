import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/layout/Navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session.organizerId) redirect("/login");

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar organizerEmail={session.organizerEmail} />
      <div className="max-w-6xl mx-auto px-6 py-10">{children}</div>
    </div>
  );
}
