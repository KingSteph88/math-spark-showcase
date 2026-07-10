import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findChapter } from "@/lib/curriculum";
import { ArrowLeft, Play, Download, FileText, BookOpen, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/student/chapter/$id")({
  loader: ({ params }) => {
    const data = findChapter(params.id);
    if (!data) throw notFound();
    return data;
  },
  component: ChapterPage,
  notFoundComponent: () => (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold">Chapter not found</h1>
      <Link to="/student/courses" className="text-coral mt-4 inline-block">Back to courses</Link>
    </div>
  ),
});

function ChapterPage() {
  const { chapter, subject } = Route.useLoaderData();

  const sections = [
    { icon: Play, title: "Recorded Lesson", desc: "Watch the full video lesson.", action: "Play video", color: "from-orange-200 to-pink-200" },
    { icon: BookOpen, title: "Summary", desc: "Key points in one elegant PDF.", action: "Download PDF", color: "from-rose-200 to-purple-200" },
    { icon: FileText, title: "Exercise Series", desc: "Practice problems to master the chapter.", action: "Download PDF", color: "from-amber-200 to-rose-200" },
    { icon: CheckCircle2, title: "Correction", desc: "Detailed step-by-step solutions.", action: "Download PDF", color: "from-fuchsia-200 to-orange-200" },
  ];

  return (
    <div className="space-y-10">
      <Link to="/student/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to courses
      </Link>

      {/* Banner */}
      <div className="relative overflow-hidden rounded-[2rem] glass-card p-10 md:p-14 shadow-soft">
        <div className="absolute -top-20 -left-20 size-80 rounded-full bg-warm-gradient opacity-30 blur-3xl" />
        <div className="relative">
          <div className="text-xs font-medium text-coral uppercase tracking-widest">{subject.name} — Chapitre {chapter.n}</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold">{chapter.title}</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">{chapter.desc}</p>
        </div>
      </div>

      {/* Video */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 hover-lift">
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 grid place-items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5" />
            <button className="relative size-20 rounded-full glass-panel grid place-items-center shadow-glow hover:scale-105 transition">
              <Play className="size-8 text-coral fill-coral ml-1" />
            </button>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div>
              <div className="font-display font-semibold text-lg">Recorded Lesson</div>
              <p className="text-sm text-muted-foreground">42 min · HD quality</p>
            </div>
            <button className="rounded-full bg-warm-gradient text-white px-5 py-2.5 text-sm font-medium shadow-soft">Watch now</button>
          </div>
        </div>

        <div className="space-y-4">
          {sections.slice(1).map((s) => (
            <div key={s.title} className="glass-card rounded-2xl p-5 hover-lift">
              <div className={`size-10 rounded-xl bg-gradient-to-br ${s.color} grid place-items-center mb-3`}>
                <s.icon className="size-5 text-foreground/80" />
              </div>
              <div className="font-display font-semibold">{s.title}</div>
              <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
              <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-coral hover:gap-3 transition-all">
                <Download className="size-4" /> {s.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
