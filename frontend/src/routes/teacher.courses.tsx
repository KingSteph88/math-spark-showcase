import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Plus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { teacherApi } from "@/lib/teacherApi";

export const Route = createFileRoute("/teacher/courses")({
  component: TeacherCourses,
});

type Course = { _id: string; title: string; slug: string; description?: string; isPublished: boolean };
type Chapter = { _id: string; title: string; description?: string; isPublished: boolean };

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function TeacherCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [chaptersByCourse, setChaptersByCourse] = useState<Record<string, Chapter[]>>({});
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newChapterTitle, setNewChapterTitle] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    setLoading(true);
    try {
      const res = await teacherApi.get("/teacher/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleOpen(courseId: string) {
    if (open === courseId) {
      setOpen(null);
      return;
    }
    setOpen(courseId);
    if (!chaptersByCourse[courseId]) {
      const res = await teacherApi.get(`/teacher/courses/${courseId}`);
      setChaptersByCourse((prev) => ({ ...prev, [courseId]: res.data.chapters }));
    }
  }

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    await teacherApi.post("/teacher/courses", {
      title: newCourseTitle,
      slug: slugify(newCourseTitle),
    });
    setNewCourseTitle("");
    loadCourses();
  }

  async function createChapter(courseId: string, e: React.FormEvent) {
    e.preventDefault();
    const title = newChapterTitle[courseId];
    if (!title?.trim()) return;
    await teacherApi.post("/teacher/courses/chapters", { courseId, title });
    setNewChapterTitle((prev) => ({ ...prev, [courseId]: "" }));
    const res = await teacherApi.get(`/teacher/courses/${courseId}`);
    setChaptersByCourse((prev) => ({ ...prev, [courseId]: res.data.chapters }));
  }

  async function togglePublish(course: Course) {
    await teacherApi.patch(`/teacher/courses/${course._id}`, { isPublished: !course.isPublished });
    loadCourses();
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-4xl font-bold">Courses Management</h1>
        <p className="mt-2 text-muted-foreground">Manage every subject and its chapters.</p>
      </div>

      <form onSubmit={createCourse} className="glass-card rounded-3xl p-6 flex gap-3">
        <input
          placeholder="New course title (e.g. Algèbre 1)"
          value={newCourseTitle}
          onChange={(e) => setNewCourseTitle(e.target.value)}
          className="flex-1 px-5 py-3 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button className="rounded-full bg-warm-gradient text-white px-5 py-3 text-sm font-medium shadow-soft inline-flex items-center gap-2">
          <Plus className="size-4" /> Add course
        </button>
      </form>

      <div className="space-y-4">
        {courses.map((course) => {
          const isOpen = open === course._id;
          const chapters = chaptersByCourse[course._id] || [];
          return (
            <div key={course._id} className="glass-card rounded-3xl overflow-hidden">
              <button
                onClick={() => toggleOpen(course._id)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-white/40 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-orange-200 to-pink-200 shadow-soft" />
                  <div>
                    <div className="font-display font-semibold text-lg">{course.title}</div>
                    <div className="text-xs text-muted-foreground">{course.isPublished ? "Published" : "Draft"}</div>
                  </div>
                </div>
                <ChevronDown className={`size-5 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => togglePublish(course)}
                      className="text-xs font-medium rounded-full glass-panel px-4 py-2 hover:bg-white transition"
                    >
                      {course.isPublished ? "Unpublish" : "Publish"}
                    </button>
                  </div>

                  {chapters.map((ch) => (
                    <div key={ch._id} className="glass-panel rounded-2xl p-5">
                      <div className="font-semibold">{ch.title}</div>
                      {ch.description && <div className="text-xs text-muted-foreground mt-1">{ch.description}</div>}
                    </div>
                  ))}

                  <form onSubmit={(e) => createChapter(course._id, e)} className="flex gap-3">
                    <input
                      placeholder="New chapter title"
                      value={newChapterTitle[course._id] || ""}
                      onChange={(e) => setNewChapterTitle((prev) => ({ ...prev, [course._id]: e.target.value }))}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/70 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button className="rounded-full bg-white px-4 py-2.5 text-xs font-medium shadow-soft hover:bg-secondary transition">
                      Add chapter
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
        {courses.length === 0 && (
          <div className="glass-card rounded-3xl p-10 text-center text-muted-foreground">No courses yet — add one above.</div>
        )}
      </div>
    </div>
  );
}
