import { createFileRoute } from "@tanstack/react-router";
import { FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { teacherApi } from "@/lib/teacherApi";

export const Route = createFileRoute("/teacher/chapters")({
  component: Chapters,
});

type Chapter = { _id: string; title: string; description?: string; isPublished: boolean };
type CourseWithChapters = { _id: string; title: string; chapters: Chapter[] };

function Chapters() {
  const [data, setData] = useState<CourseWithChapters[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const coursesRes = await teacherApi.get("/teacher/courses");
        const detailed = await Promise.all(
          coursesRes.data.map(async (c: any) => {
            const detail = await teacherApi.get(`/teacher/courses/${c._id}`);
            return { _id: c._id, title: c.title, chapters: detail.data.chapters };
          })
        );
        setData(detailed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const allChapters = data.flatMap((c) => c.chapters.map((ch) => ({ ...ch, courseTitle: c.title })));

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-4xl font-bold">Chapters</h1>
        <p className="mt-2 text-muted-foreground">All {allChapters.length} chapters across every course.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allChapters.map((c) => (
          <div key={c._id} className="glass-card rounded-2xl p-5 hover-lift">
            <div className="text-xs text-coral font-medium uppercase tracking-wider">{c.courseTitle}</div>
            <div className="font-display font-semibold mt-1">{c.title}</div>
            {c.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>}
            <div className="mt-4 text-xs text-muted-foreground inline-flex items-center gap-2">
              <FileText className="size-3.5" /> {c.isPublished ? "Published" : "Draft"}
            </div>
          </div>
        ))}
        {allChapters.length === 0 && (
          <div className="col-span-full glass-card rounded-3xl p-10 text-center text-muted-foreground">
            No chapters yet — add courses and chapters from the Courses page.
          </div>
        )}
      </div>
    </div>
  );
}
