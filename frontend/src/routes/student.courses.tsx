import { createFileRoute, Link } from "@tanstack/react-router";
import { allSemesters } from "@/lib/curriculum";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/student/courses")({
  component: Courses,
});

function Courses() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold">Courses</h1>
        <p className="mt-2 text-muted-foreground">Two subjects. Fourteen chapters. Beautifully organized.</p>
      </div>

      {allSemesters.map((sem) => (
        <section key={sem.label} className="space-y-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-display font-semibold">{sem.label}</h2>
            <div className="h-px flex-1 mx-6 bg-border" />
            <span className="text-sm text-muted-foreground">{sem.subjects.reduce((a, s) => a + s.chapters.length, 0)} chapters</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {sem.subjects.map((subj) => (
              <div key={subj.slug} className="relative overflow-hidden rounded-3xl glass-card p-6 shadow-soft">
                <div className={`absolute -top-16 -right-16 size-48 rounded-full bg-gradient-to-br ${subj.hue} blur-2xl opacity-70`} />
                <div className="relative">
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="text-xl font-display font-semibold uppercase tracking-wide">{subj.name}</h3>
                    <span className="text-xs text-muted-foreground">{subj.chapters.length} chapters</span>
                  </div>
                  <div className="space-y-3">
                    {subj.chapters.map((ch) => (
                      <div key={ch.id} className="glass-panel rounded-2xl p-4 hover-lift">
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 size-12 rounded-xl bg-warm-gradient text-white grid place-items-center font-display font-bold shadow-soft">
                            {ch.n}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold">Chapitre {ch.n} — {ch.title}</div>
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{ch.desc}</p>
                          </div>
                          <Link
                            to="/student/chapter/$id"
                            params={{ id: ch.id }}
                            className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-coral hover:gap-2 transition-all"
                          >
                            View Lesson <ArrowRight className="size-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
