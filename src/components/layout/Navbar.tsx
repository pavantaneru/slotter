"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  organizerEmail?: string;
  showDashboardLink?: boolean;
}

export function Navbar({ organizerEmail, showDashboardLink = false }: NavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="border-b-2 border-brand-black bg-brand-bg">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href={organizerEmail ? "/dashboard" : "/"}
          className="text-2xl font-black uppercase tracking-tight text-brand-black hover:text-brand-orange transition-colors"
        >
          SLOTTER
        </Link>

        <div className="flex items-center gap-4">
          {showDashboardLink && (
            <Link
              href="/dashboard"
              className="text-sm font-bold uppercase tracking-wide text-brand-black/60 hover:text-brand-black"
            >
              Dashboard
            </Link>
          )}
          {organizerEmail ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-brand-black/50 hidden sm:block">
                {organizerEmail}
              </span>
              <Button
                variant="ghost"
                onClick={handleLogout}
                loading={loggingOut}
                className="text-xs py-1.5"
              >
                LOG OUT
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="primary" className="text-xs py-1.5">
                ORGANIZER LOGIN
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
