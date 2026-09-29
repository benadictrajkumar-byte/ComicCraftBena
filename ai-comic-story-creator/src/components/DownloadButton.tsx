"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DownloadButtonProps {
  id: string;
  className?: string;
  label?: string;
}

/**
 * Downloads the exported PDF as an attachment, then redirects to the export
 * success page — the exact flow from the original spec.
 */
export default function DownloadButton({ id, className, label }: DownloadButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "working" | "error">("idle");

  async function handleDownload() {
    if (state === "working") return;
    setState("working");
    try {
      const res = await fetch(`/api/export/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const dispo = res.headers.get("content-disposition") ?? "";
      const match = /filename="?([^";]+)"?/.exec(dispo);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = match?.[1] ?? "comiccraft.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      router.push(`/export/success?id=${id}`);
    } catch {
      setState("error");
      window.setTimeout(() => setState("idle"), 2200);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={state === "working"}
      className={cn("btn-pop bg-gold text-ink", className)}
    >
      {state === "working" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileDown className="h-5 w-5" />}
      {state === "working" ? "Binding PDF…" : state === "error" ? "Retry download" : (label ?? "Download as PDF")}
    </button>
  );
}
