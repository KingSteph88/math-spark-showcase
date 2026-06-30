import { createFileRoute } from "@tanstack/react-router";
import { allSemesters } from "@/lib/curriculum";
import { Edit, Upload, FileText, ListChecks, CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/teacher/courses")({
  component: TeacherCourses,
});

function TeacherCourses() {
  const [open, setOpen] = useState<string | null>("algebre-1");

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-4xl font-bold">Courses Management</h1>
        <p className="mt-2 text-muted-foreground">Manage every subject, chapter and uploaded file.</p>
      </div>

      <div className="space-y-4">
        {allSemesters.flatMap((sem) =>
          sem.subjects.map((subj) => {
            const isOpen = open === subj.slug;
            return (
              <div key={subj.slug} className="glass-card rounded-3xl overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : subj.slug)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-white/40 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-2xl bg-gradient-to-br ${subj.hue} shadow-soft`} />
                    <div>
                      <div className="text-xs text-muted-foreground">{sem.label}</div>
                      <div className="font-display font-semibold text-lg">{subj.name}</div>
                    </div>
                  </div>
                  <ChevronDown className={`size-5 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 space-y-3 animate-fade-in">
                    {subj.chapters.map((ch) => (
                      <div key={ch.id} className="glass-panel rounded-2xl p-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="size-10 rounded-xl bg-warm-gradient text-white grid place-items-center font-display font-bold">
                              {ch.n}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold truncate">Chapitre {ch.n} — {ch.title}</div>
                              <div className="text-xs text-muted-foreground truncate">{ch.desc}</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <ActionBtn icon={Edit}>Edit</ActionBtn>
                            <ActionBtn icon={Upload}>Upload Lesson</ActionBtn>
                            <ActionBtn icon={FileText}>Upload PDF</ActionBtn>
                            <ActionBtn icon={ListChecks}>Exercises</ActionBtn>
                            <ActionBtn icon={CheckCircle2}>Correction</ActionBtn>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 text-xs font-medium hover:bg-white hover:shadow-soft transition">
      <Icon className="size-3.5" /> {children}
    </button>
  );
}
