import { createFileRoute } from "@tanstack/react-router";
import { Calculator, FileText, ListChecks, GraduationCap, CheckCircle2, Download } from "lucide-react";

export const Route = createFileRoute("/student/resources")({
  component: Resources,
});

const resources = [
  { icon: Calculator, title: "Formula Sheets", desc: "All essential formulas in one place.", count: 8, color: "from-orange-200 to-pink-200" },
  { icon: FileText, title: "Course Summaries", desc: "Condensed chapter overviews.", count: 14, color: "from-rose-200 to-purple-200" },
  { icon: ListChecks, title: "Exercise Series", desc: "Targeted practice sets.", count: 22, color: "from-amber-200 to-rose-200" },
  { icon: GraduationCap, title: "Previous Exams", desc: "Past papers from prior years.", count: 12, color: "from-fuchsia-200 to-orange-200" },
  { icon: CheckCircle2, title: "Corrections", desc: "Step-by-step solutions.", count: 30, color: "from-pink-200 to-purple-200" },
];

function Resources() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Resources</h1>
        <p className="mt-2 text-muted-foreground">Everything you need — formula sheets, summaries, exercises and exams.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map((r) => (
          <div key={r.title} className="glass-card rounded-3xl p-6 hover-lift">
            <div className={`size-12 rounded-2xl bg-gradient-to-br ${r.color} grid place-items-center mb-5 shadow-soft`}>
              <r.icon className="size-6 text-foreground/80" />
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="font-display font-semibold text-lg">{r.title}</h3>
              <span className="text-xs text-muted-foreground">{r.count} files</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
            <button className="mt-5 w-full rounded-full glass-panel py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-white transition">
              <Download className="size-4" /> Browse files
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
