import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, FileCheck2, Trophy } from "lucide-react";

export const Route = createFileRoute("/student/exam-prep")({
  component: ExamPrep,
});

const items = [
  { icon: ClipboardList, title: "Midterm Review", desc: "Consolidate the first half of the semester with focused exercises and key formulas.", tone: "from-orange-200 to-pink-200" },
  { icon: FileCheck2, title: "Mock Exams", desc: "Simulate exam conditions with timed past papers and instant corrections.", tone: "from-rose-200 to-purple-200" },
  { icon: Trophy, title: "Final Exam Preparation", desc: "Master every chapter with a curated roadmap to acing your finals.", tone: "from-amber-200 to-rose-200" },
];

function ExamPrep() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Exam Preparation</h1>
        <p className="mt-2 text-muted-foreground">Three structured paths to walk into your exams confident.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {items.map((it) => (
          <div key={it.title} className="relative overflow-hidden rounded-3xl glass-card p-8 hover-lift">
            <div className={`absolute -top-16 -right-16 size-48 rounded-full bg-gradient-to-br ${it.tone} blur-2xl opacity-70`} />
            <div className="relative">
              <div className="size-12 rounded-2xl bg-warm-gradient grid place-items-center text-white shadow-soft">
                <it.icon className="size-6" />
              </div>
              <h3 className="mt-5 text-xl font-display font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
              <button className="mt-6 inline-flex items-center gap-1 text-coral font-medium text-sm hover:gap-2 transition-all">
                Start preparing <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
