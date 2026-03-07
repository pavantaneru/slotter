import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function BookingSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <div className="bg-white border-2 border-brand-black shadow-brutal-xl p-12">
            <div className="inline-block bg-brand-yellow border-2 border-brand-black px-4 py-2 text-2xl font-black mb-6">
              ✓
            </div>
            <h1 className="text-4xl font-black text-brand-black mb-4">
              YOU&apos;RE BOOKED!
            </h1>
            <p className="text-base font-medium normal-case text-brand-black/60 mb-8">
              Your spot is confirmed. Check your email for a confirmation with the details.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/">
                <div className="w-full border-2 border-brand-black bg-brand-black text-brand-yellow py-3 font-black uppercase tracking-wide text-sm press-effect text-center">
                  BACK TO HOME
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
