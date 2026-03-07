import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="border-b-2 border-brand-black bg-brand-yellow">
          <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
            <div className="max-w-3xl">
              <span className="inline-block bg-brand-black text-brand-yellow text-xs font-black uppercase tracking-widest px-3 py-1 mb-6">
                GROUP BOOKING
              </span>
              <h1 className="text-7xl md:text-9xl font-black text-brand-black leading-none mb-6">
                BOOK<br />SLOTS.<br />FILL<br />THEM.
              </h1>
              <p className="text-xl font-bold text-brand-black/70 mb-10 max-w-xl normal-case">
                Create a booking page. Set your time slots. Let multiple people book the same slot — up to your capacity limit.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login">
                  <div className="inline-flex items-center gap-2 bg-brand-black text-brand-yellow border-2 border-brand-black shadow-brutal-lg px-8 py-4 font-black uppercase tracking-wide text-lg press-effect">
                    CREATE BOOKING PAGE →
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b-2 border-brand-black bg-brand-bg">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <h2 className="text-4xl font-black text-brand-black mb-12">HOW IT WORKS</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  num: "01",
                  color: "bg-brand-yellow",
                  title: "CREATE A PAGE",
                  desc: "Set up your booking page with a name, description, and time slots. Configure capacity per slot.",
                },
                {
                  num: "02",
                  color: "bg-brand-orange",
                  title: "SHARE THE LINK",
                  desc: "Send your unique booking URL to attendees. Anyone with the link can view and book available slots.",
                },
                {
                  num: "03",
                  color: "bg-brand-red",
                  title: "FILL UP FAST",
                  desc: "Attendees pick their slot and book instantly. Slots close when full. You get notified of every booking.",
                },
              ].map((f) => (
                <div
                  key={f.num}
                  className="bg-white border-2 border-brand-black shadow-brutal-lg p-6"
                >
                  <div
                    className={`inline-block ${f.color} border-2 border-brand-black text-brand-black font-black text-sm px-3 py-1 mb-4`}
                  >
                    {f.num}
                  </div>
                  <h3 className="text-xl font-black text-brand-black mb-2">{f.title}</h3>
                  <p className="text-sm text-brand-black/60 font-medium normal-case">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features list */}
        <section className="border-b-2 border-brand-black bg-white">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <h2 className="text-4xl font-black text-brand-black mb-12">EVERYTHING YOU NEED</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Group booking — multiple people per slot",
                "Configurable capacity per slot",
                "Email OTP verification (optional)",
                "One booking per person per page",
                "Cancel slots with auto-notifications",
                "Cancel individual bookings",
                "Export all bookings as CSV",
                "Automatic confirmation emails",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 border-2 border-brand-black p-4 bg-brand-bg"
                >
                  <span className="text-brand-orange font-black text-xl">→</span>
                  <span className="font-bold text-sm normal-case">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-brand-black">
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <h2 className="text-5xl font-black text-brand-yellow mb-6">
              READY TO START?
            </h2>
            <p className="text-brand-yellow/60 font-bold mb-10 normal-case">
              Free to use. No credit card required.
            </p>
            <Link href="/login">
              <div className="inline-flex items-center gap-2 bg-brand-yellow text-brand-black border-2 border-brand-yellow shadow-brutal-lg px-10 py-5 font-black uppercase tracking-wide text-xl press-effect">
                GET STARTED FREE →
              </div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
