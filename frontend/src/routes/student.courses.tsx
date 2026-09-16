import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/student/courses")({
  component: Courses,
});

type ChapterSummary = {
  id: string;
  title: string;
  description?: string;
  order: number;
  totalLessons: number;
  completedLessons: number;
  progress: number;
};

type CourseSummary = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  chapters: ChapterSummary[];
};

const HUES = [
  "from-orange-300/60 to-pink-300/60",
  "from-rose-300/60 to-purple-300/60",
  "from-amber-300/60 to-rose-300/60",
  "from-fuchsia-300/60 to-orange-300/60",
];
function Courses() {
  const location = useLocation();

  if (location.pathname !== "/student/courses") {
    return <Outlet />;
  }

  return <CoursesList />;
}
function CoursesList() {
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await api.get("/student/courses");
        setCourses(res.data);
      } catch (err) {
        console.error(err);
        setError("Couldn't load your courses right now.");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error || !courses) {
    return <div className="text-center text-muted-foreground py-10">{error || "No courses found."}</div>;
  }

  const totalChapters = courses.reduce((a, c) => a + c.chapters.length, 0);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold">Courses</h1>
        <p className="mt-2 text-muted-foreground">
          {courses.length} subjects. {totalChapters} chapters. Beautifully organized.
        </p>
      </div>

      {courses.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
          No courses have been published yet. Check back soon.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {courses.map((subj, i) => (
          <div key={subj.id} className="relative overflow-hidden rounded-3xl glass-card p-6 shadow-soft">
            <div
              className={`absolute -top-16 -right-16 size-48 rounded-full bg-gradient-to-br ${HUES[i % HUES.length]} blur-2xl opacity-70`}
            />
            <div className="relative">
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-xl font-display font-semibold uppercase tracking-wide">{subj.title}</h3>
                <span className="text-xs text-muted-foreground">{subj.chapters.length} chapters</span>
              </div>
              {subj.description && (
                <p className="text-sm text-muted-foreground mb-4">{subj.description}</p>
              )}
              <div className="space-y-3">
                {subj.chapters.map((ch, idx) => (
                  <div key={ch.id} className="glass-panel rounded-2xl p-4 hover-lift">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 size-12 rounded-xl bg-warm-gradient text-white grid place-items-center font-display font-bold shadow-soft">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">
                          Chapitre {idx + 1} — {ch.title}
                        </div>
                        {ch.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{ch.description}</p>
                        )}
                        <div className="mt-2 h-1.5 bg-secondary rounded-full max-w-xs">
                          <div
                            className="h-full bg-warm-gradient rounded-full"
                            style={{ width: `${ch.progress}%` }}
                          />
                        </div>
                      </div>
                      <Link
                        to="/student/courses/$courseId/chapters/$chapterId"
                        params={{ courseId: subj.id, chapterId: ch.id }}
                        className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-coral hover:gap-2 transition-all"
                      >
                        View Lesson <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                ))}
                {subj.chapters.length === 0 && (
                  <p className="text-sm text-muted-foreground">No chapters published yet.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}