"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { BookingPageForm, BookingPageFormData } from "@/components/forms/BookingPageForm";
import { useToast } from "@/components/ui/Toast";

export default function EditPagePage() {
  const params = useParams<{ pageId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [initial, setInitial] = useState<BookingPageFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/pages/${params.pageId}`)
      .then((r) => r.json())
      .then((data) => setInitial(data));
  }, [params.pageId]);

  async function handleSubmit(data: BookingPageFormData) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/pages/${params.pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) { setError(result.error); return; }
      toast("Page updated!", "success");
      router.push(`/dashboard/${params.pageId}`);
    } finally {
      setLoading(false);
    }
  }

  if (!initial) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-brand-black/10 w-48" />
          <div className="h-64 bg-brand-black/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/dashboard/${params.pageId}`} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-black/50 hover:text-brand-black mb-6">
        ← Back
      </Link>
      <h1 className="text-4xl font-black text-brand-black mb-8">EDIT PAGE</h1>
      <div className="bg-white border-2 border-brand-black shadow-brutal-lg p-8">
        <BookingPageForm
          initial={initial}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          submitLabel="SAVE CHANGES"
        />
      </div>
    </div>
  );
}
