import { createFileRoute } from "@tanstack/react-router";
import { allSemesters } from "@/lib/curriculum";
import { Edit, FileText } from "lucide-react";

export const Route = createFileRoute("/teacher/chapters")({
  component: Chapters,
});

function Chapters() {
  const all = allSemesters.flatMap((s) => s.subjects.flatMap((sub) => sub.chapters.map((c) => ({ ...c, subject: sub.name }))));
  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-4xl font-bold">Chapters</h1>
        <p className="mt-2 text-muted-foreground">All {all.length} chapters across both semesters.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {all.map((c) => (
          <div key={c.id} className="glass-card rounded-2xl p-5 hover-lift">
            <div className="flex items-start justify-between">
              <div className="size-10 rounded-xl bg-warm-gradient text-white grid place-items-center font-display font-bold">{c.n}</div>
              <button className="rounded-full p-2 hover:bg-white transition"><Edit className="size-4 text-muted-foreground" /></button>
            </div>
            <div className="text-xs text-coral font-medium mt-3 uppercase tracking-wider">{c.subject}</div>
            <div className="font-display font-semibold mt-1">{c.title}</div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.desc}</p>
            <button className="mt-4 w-full rounded-full glass-panel py-2 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-white transition">
              <FileText className="size-4" /> Manage files
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
