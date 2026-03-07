"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface ExportButtonProps {
  pageId: string;
}

export function ExportButton({ pageId }: ExportButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/export`);
      if (!res.ok) {
        toast("Failed to export CSV", "error");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : "slotter-export.csv";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast("CSV downloaded!", "success");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" onClick={handleExport} loading={loading} className="text-xs">
      EXPORT CSV ↓
    </Button>
  );
}
