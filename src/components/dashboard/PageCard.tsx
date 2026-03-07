import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PageCardProps {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  requireAuth: boolean;
  slotCount: number;
  bookingCount: number;
  createdAt: string;
}

export function PageCard({
  id,
  name,
  slug,
  isActive,
  requireAuth,
  slotCount,
  bookingCount,
}: PageCardProps) {
  return (
    <div className="bg-white border-2 border-brand-black shadow-brutal-lg p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black uppercase text-brand-black truncate">{name}</h3>
          <p className="text-xs font-mono text-brand-black/50 mt-1 truncate">/book/{slug}</p>
        </div>
        <Badge variant={isActive ? "active" : "inactive"} />
      </div>

      <div className="flex gap-4 text-xs font-bold uppercase tracking-wide">
        <div>
          <span className="text-brand-black/40">Slots</span>
          <p className="text-2xl font-black text-brand-black">{slotCount}</p>
        </div>
        <div>
          <span className="text-brand-black/40">Bookings</span>
          <p className="text-2xl font-black text-brand-orange">{bookingCount}</p>
        </div>
        {requireAuth && (
          <div className="ml-auto flex items-end">
            <span className="text-xs bg-brand-black text-brand-yellow px-2 py-0.5 font-black uppercase">
              OTP ON
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2 border-t-2 border-brand-black/10">
        <Link href={`/dashboard/${id}`} className="flex-1">
          <Button variant="dark" className="w-full text-xs">MANAGE</Button>
        </Link>
        <Link href={`/book/${slug}`} target="_blank" className="flex-1">
          <Button variant="ghost" className="w-full text-xs">VIEW →</Button>
        </Link>
      </div>
    </div>
  );
}
