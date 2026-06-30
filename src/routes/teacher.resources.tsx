import { createFileRoute } from "@tanstack/react-router";
import { Upload, FileText, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/teacher/resources")({
  component: TeacherResources,
});

const files = [
  { name: "Formules — Algèbre 1.pdf", category: "Formula Sheets", size: "1.2 MB", date: "Mar 12" },
  { name: "Résumé — Limites et Continuité.pdf", category: "Summary", size: "820 KB", date: "Mar 10" },
  { name: "Série 3 — Espaces Vectoriels.pdf", category: "Exercises", size: "640 KB", date: "Mar 09" },
  { name: "Correction — Série 3.pdf", category: "Correction", size: "910 KB", date: "Mar 09" },
  { name: "Examen 2024 — Analyse 1.pdf", category: "Previous Exam", size: "1.4 MB", date: "Mar 02" },
];

function TeacherResources() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Resources</h1>
          <p className="mt-2 text-muted-foreground">Manage every uploaded PDF and document.</p>
        </div>
        <button className="rounded-full bg-warm-gradient text-white px-6 py-3 font-medium shadow-soft inline-flex items-center gap-2">
          <Upload className="size-4" /> Upload file
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="px-6 py-4 grid grid-cols-[1fr_auto_auto_auto_auto] gap-6 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
          <div>File</div><div>Category</div><div>Size</div><div>Date</div><div /></div>
        {files.map((f, i) => (
          <div key={i} className="px-6 py-4 grid grid-cols-[1fr_auto_auto_auto_auto] gap-6 items-center hover:bg-white/40 transition">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-xl bg-gradient-to-br from-orange-200 to-pink-200 grid place-items-center shrink-0">
                <FileText className="size-5 text-coral" />
              </div>
              <span className="font-medium truncate">{f.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">{f.category}</span>
            <span className="text-sm text-muted-foreground">{f.size}</span>
            <span className="text-sm text-muted-foreground">{f.date}</span>
            <button className="rounded-full p-2 hover:bg-white transition"><MoreHorizontal className="size-4 text-muted-foreground" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
