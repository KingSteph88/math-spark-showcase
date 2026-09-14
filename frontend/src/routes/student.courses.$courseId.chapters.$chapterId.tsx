import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Play,
  Download,
  BookOpen,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/student/courses/$courseId/chapters/$chapterId")({
  component: ChapterPage,
});

type Lesson = {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  videoDurationSeconds?: number;
  completed: boolean;
  watchTimeSeconds: number;
};

type Resource = {
  id: string;
  title: string;
  category: "course_summary" | "exercise_series" | "correction";
  fileUrl: string;
  fileType?: string;
};

type ChapterDetail = {
  id: string;
  title: string;
  description?: string;
  learningObjectives?: string[];
  course: { id: string; title: string; slug: string };
  lessons: Lesson[];
  resources: Resource[];
};

const RESOURCE_META: Record<Resource["category"], { icon: any; title: string; color: string }> = {
  course_summary: { icon: BookOpen, title: "Summary", color: "from-rose-200 to-purple-200" },
  exercise_series: { icon: FileText, title: "Exercise Series", color: "from-amber-200 to-rose-200" },
  correction: { icon: CheckCircle2, title: "Correction", color: "from-fuchsia-200 to-orange-200" },
};

function formatDuration(seconds?: number) {
  if (!seconds) return null;
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

function ChapterPage() {
  const { courseId, chapterId } = Route.useParams();

  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/student/courses/${courseId}/chapters/${chapterId}`);
        setChapter(res.data);
        setActiveLessonId(res.data.lessons?.[0]?.id ?? null);
      } catch (err) {
        console.error(err);
        setError("This chapter couldn't be loaded.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [courseId, chapterId]);

  async function markLessonComplete(lessonId: string) {
    setMarking(true);
    try {
      await api.post(`/student/courses/lessons/${lessonId}/progress`, {
        completed: true,
      });
      setChapter((prev) =>
        prev
          ? {
              ...prev,
              lessons: prev.lessons.map((l) =>
                l.id === lessonId ? { ...l, completed: true } : l
              ),
            }
          : prev
      );
    } catch (err) {
      console.error(err);
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">{error || "Chapter not found"}</h1>
        <Link to="/student/courses" className="text-coral mt-4 inline-block">
          Back to courses
        </Link>
      </div>
    );
  }

  const activeLesson = chapter.lessons.find((l) => l.id === activeLessonId) ?? chapter.lessons[0];
  const otherResources = chapter.resources.filter((r) => r.category !== "course_summary" || true);

  return (
    <div className="space-y-10">
      <Link
        to="/student/courses"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to courses
      </Link>

      {/* Banner */}
      <div className="relative overflow-hidden rounded-[2rem] glass-card p-10 md:p-14 shadow-soft">
        <div className="absolute -top-20 -left-20 size-80 rounded-full bg-warm-gradient opacity-30 blur-3xl" />
        <div className="relative">
          <div className="text-xs font-medium text-coral uppercase tracking-widest">
            {chapter.course.title}
          </div>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold">{chapter.title}</h1>
          {chapter.description && (
            <p className="mt-4 text-muted-foreground max-w-2xl">{chapter.description}</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video + lesson list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-3xl p-6 hover-lift">
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 grid place-items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5" />
              {activeLesson?.videoUrl ? (
                <a
                  href={activeLesson.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="relative size-20 rounded-full glass-panel grid place-items-center shadow-glow hover:scale-105 transition"
                >
                  <Play className="size-8 text-coral fill-coral ml-1" />
                </a>
              ) : (
                <div className="relative size-20 rounded-full glass-panel grid place-items-center opacity-60">
                  <Play className="size-8 text-coral fill-coral ml-1" />
                </div>
              )}
            </div>
            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <div className="font-display font-semibold text-lg">
                  {activeLesson?.title ?? "No lesson yet"}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDuration(activeLesson?.videoDurationSeconds) ?? "Video coming soon"}
                </p>
              </div>
              {activeLesson && (
                <button
                  disabled={activeLesson.completed || marking}
                  onClick={() => markLessonComplete(activeLesson.id)}
                  className="rounded-full bg-warm-gradient text-white px-5 py-2.5 text-sm font-medium shadow-soft disabled:opacity-50"
                >
                  {activeLesson.completed ? "Completed" : "Mark as done"}
                </button>
              )}
            </div>
          </div>

          {chapter.lessons.length > 1 && (
            <div className="glass-card rounded-2xl p-4 space-y-2">
              {chapter.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                    lesson.id === activeLesson?.id
                      ? "bg-white shadow-soft font-medium"
                      : "hover:bg-white/60 text-muted-foreground"
                  }`}
                >
                  <span>{lesson.title}</span>
                  {lesson.completed && <CheckCircle2 className="size-4 text-coral shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {chapter.lessons.length === 0 && (
            <p className="text-sm text-muted-foreground px-1">No lessons published for this chapter yet.</p>
          )}
        </div>

        {/* Resources */}
        <div className="space-y-4">
          {otherResources.map((r) => {
            const meta = RESOURCE_META[r.category];
            const Icon = meta.icon;
            return (
              <div key={r.id} className="glass-card rounded-2xl p-5 hover-lift">
                <div className={`size-10 rounded-xl bg-gradient-to-br ${meta.color} grid place-items-center mb-3`}>
                  <Icon className="size-5 text-foreground/80" />
                </div>
                <div className="font-display font-semibold">{meta.title}</div>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{r.title}</p>
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-coral hover:gap-3 transition-all"
                >
                  <Download className="size-4" /> Download {r.fileType ?? "file"}
                </a>
              </div>
            );
          })}
          {otherResources.length === 0 && (
            <div className="glass-card rounded-2xl p-5 text-sm text-muted-foreground">
              No resources attached to this chapter yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}