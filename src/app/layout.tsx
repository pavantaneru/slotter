import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Slotter — Group Booking Made Simple",
  description: "Create booking pages where multiple people can book the same time slot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-bg">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
