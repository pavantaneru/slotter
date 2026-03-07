import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { PageCard } from "@/components/dashboard/PageCard";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.organizerId) redirect("/login");

  const pages = await prisma.bookingPage.findMany({
    where: { organizerId: session.organizerId },
    orderBy: { createdAt: "desc" },
    include: {
      timeSlots: {
        include: {
          _count: { select: { bookings: { where: { cancelledAt: null } } } },
        },
      },
    },
  });

  const pagesWithCounts = pages.map((page) => ({
    ...page,
    slotCount: page.timeSlots.length,
    bookingCount: page.timeSlots.reduce((sum, slot) => sum + slot._count.bookings, 0),
    createdAt: page.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-brand-black">YOUR PAGES</h1>
          <p className="text-sm font-bold text-brand-black/50 mt-1 normal-case">
            {pages.length} booking {pages.length === 1 ? "page" : "pages"}
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button variant="primary">+ NEW PAGE</Button>
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="border-2 border-dashed border-brand-black/30 p-16 text-center">
          <p className="text-2xl font-black text-brand-black/30 mb-4">NO PAGES YET</p>
          <p className="text-sm font-bold text-brand-black/30 mb-8 normal-case">
            Create your first booking page to get started.
          </p>
          <Link href="/dashboard/new">
            <Button variant="primary">CREATE YOUR FIRST PAGE</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagesWithCounts.map((page) => (
            <PageCard key={page.id} {...page} />
          ))}
        </div>
      )}
    </div>
  );
}
