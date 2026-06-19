"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExportPage() {
  const exportCsv = useAction(api.export.exportCsv);
  const exportJson = useAction(api.export.exportJson);
  const [busy, setBusy] = useState<"csv" | "json" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = async (kind: "csv" | "json") => {
    setBusy(kind);
    setError(null);
    try {
      const content =
        kind === "csv" ? await exportCsv({}) : await exportJson({});
      const blob = new Blob([content], {
        type: kind === "csv" ? "text/csv" : "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `homeschoolhero-export.${kind}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Export Learning History</h1>
        <p className="text-sm text-muted-foreground">
          Download all lessons, quiz attempts, watch time, points and redemptions.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <FileSpreadsheet size={28} className="mx-auto mb-3 text-green-400" />
          <h2 className="text-lg font-semibold text-white">CSV</h2>
          <p className="mb-4 text-xs text-muted-foreground">Spreadsheet-friendly, one row per record.</p>
          <Button onClick={() => download("csv")} disabled={busy !== null} className="bg-blue-500 text-white hover:bg-blue-400">
            {busy === "csv" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download CSV
          </Button>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <FileJson size={28} className="mx-auto mb-3 text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">JSON</h2>
          <p className="mb-4 text-xs text-muted-foreground">Full structured dataset for backups or re-import.</p>
          <Button onClick={() => download("json")} disabled={busy !== null} className="bg-blue-500 text-white hover:bg-blue-400">
            {busy === "json" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download JSON
          </Button>
        </div>
      </section>
    </div>
  );
}
