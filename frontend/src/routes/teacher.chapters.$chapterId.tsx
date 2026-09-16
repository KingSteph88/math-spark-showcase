import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2, Loader2, Video, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { teacherApi } from "@/lib/teacherApi";

export const Route = createFileRoute("/teacher/chapters/$chapterId")({
  component: ChapterLessons,
});

type Lesson = {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  isPublished: boolean;
  order: number;
  downloadableResources: { resourceId: string | { _id: string; title: string } }[];
};

type ResourceOption = { _id: string; title: string; category: string };
type ChapterInfo = { _id: string; title: string; courseTitle: string };

const emptyForm = {
  title: "",
  description: "",
  videoUrl: "",
  order: "0",
  // Default to published: a teacher adding a lesson expects students to
  // see it, not to have to remember a second toggle.
  isPublished: true,
  resourceIds: [] as string[],
};

// Mirrors the backend check so a bad paste is caught before the request.
const YOUTUBE_RE =
  /^(https?:\/\/)?((www\.|m\.)?(youtube\.com|youtube-nocookie\.com)\/(watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)[A-Za-z0-9_-]{11}/;

function ChapterLessons() {
  const { chapterId } = Route.useParams();
  const [chapterInfo, setChapterInfo] = useState<ChapterInfo | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [resources, setResources] = useState<ResourceOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, [chapterId]);

  async function load() {
    setLoading(true);
    try {
      const [coursesRes, resourcesRes, lessonsRes] = await Promise.all([
        teacherApi.get("/teacher/courses"),
        teacherApi.get("/teacher/resources"),
        teacherApi.get("/teacher/lessons", { params: { chapterId } }),
      ]);
      setResources(resourcesRes.data);
      setLessons(lessonsRes.data);

      // No single-chapter endpoint yet, so find it by scanning courses —
      // fine at this data size, revisit if the course list ever gets huge.
      for (const c of coursesRes.data) {
        const detail = await teacherApi.get(`/teacher/courses/${c._id}`);
        const match = detail.data.chapters.find((ch: any) => ch._id === chapterId);
        if (match) {
          setChapterInfo({ _id: match._id, title: match.title, courseTitle: c.title });
          break;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(lesson: Lesson) {
    setEditingId(lesson._id);
    setForm({
      title: lesson.title,
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      order: String(lesson.order),
      isPublished: lesson.isPublished,
      resourceIds: lesson.downloadableResources.map((r) =>
        typeof r.resourceId === "string" ? r.resourceId : r.resourceId._id
      ),
    });
    setVideoFile(null);
    setShowForm(true);
  }

  function toggleResource(id: string) {
    setForm((prev) => ({
      ...prev,
      resourceIds: prev.resourceIds.includes(id)
        ? prev.resourceIds.filter((r) => r !== id)
        : [...prev.resourceIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const videoUrl = form.videoUrl.trim();

    // On create the link is required; on edit an empty box means
    // "keep the current video".
    if (!editingId && !videoUrl) {
      setFormError("Paste the YouTube link for this lesson.");
      return;
    }
    if (videoUrl && !YOUTUBE_RE.test(videoUrl)) {
      setFormError("That doesn't look like a YouTube link.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        order: Number(form.order) || 0,
        isPublished: form.isPublished,
        resourceIds: form.resourceIds,
      };

      if (videoUrl) payload.videoUrl = videoUrl;

      if (editingId) {
        await teacherApi.patch(`/teacher/lessons/${editingId}`, payload);
      } else {
        await teacherApi.post("/teacher/lessons", {
          ...payload,
          chapterId,
        });
      }

      setShowForm(false);
      load();
    } catch (err: any) {
      setFormError(err.response?.data?.error || "Could not save this lesson.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await teacherApi.delete(`/teacher/lessons/${id}`);
    load();
  }

  async function togglePublish(lesson: Lesson) {
    await teacherApi.patch(`/teacher/lessons/${lesson._id}`, { isPublished: !lesson.isPublished });
    load();
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <Link to="/teacher/chapters" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to chapters
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs text-coral font-medium uppercase tracking-wider">{chapterInfo?.courseTitle}</div>
          <h1 className="text-4xl font-bold mt-1">{chapterInfo?.title ?? "Chapter"}</h1>
          <p className="mt-2 text-muted-foreground">{lessons.length} lessons</p>
        </div>
        <button
          onClick={openCreateForm}
          className="rounded-full bg-warm-gradient text-white px-6 py-3 font-medium shadow-soft inline-flex items-center gap-2"
        >
          <Plus className="size-4" /> Add lesson
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 space-y-4">
          {formError && (
            <div className="rounded-2xl bg-red-100 text-red-700 px-4 py-3 text-sm">
              {formError}
            </div>
          )}
          <input
            placeholder="Lesson title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">
                YouTube link {editingId && "(leave empty to keep current)"}
              </label>
              <input
                type="url"
                inputMode="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-border text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/70 border border-border text-sm mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Attach resources (PDFs, images, etc.)</label>
            <div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {resources.map((r) => (
                <button
                  type="button"
                  key={r._id}
                  onClick={() => toggleResource(r._id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    form.resourceIds.includes(r._id)
                      ? "bg-warm-gradient text-white border-transparent"
                      : "bg-white/70 border-border text-muted-foreground"
                  }`}
                >
                  {r.title}
                </button>
              ))}
              {resources.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No resources uploaded yet — add some from the Resources page first.
                </p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            Published (visible to students)
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full glass-panel px-5 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="rounded-full bg-warm-gradient text-white px-6 py-2.5 text-sm font-medium shadow-soft disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin inline" /> : editingId ? "Save changes" : "Add lesson"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {lessons.map((lesson) => (
          <div key={lesson._id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold">{lesson.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      lesson.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-secondary"
                    }`}
                  >
                    {lesson.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                {lesson.description && <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {lesson.videoUrl && (
                    <span className="inline-flex items-center gap-1">
                      <Video className="size-3.5" /> YouTube video
                    </span>
                  )}
                  {lesson.downloadableResources.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <FileText className="size-3.5" /> {lesson.downloadableResources.length} resource(s)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => togglePublish(lesson)}
                  className="text-xs font-medium rounded-full glass-panel px-3 py-2 hover:bg-white transition"
                >
                  {lesson.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => openEditForm(lesson)}
                  className="text-xs font-medium rounded-full glass-panel px-3 py-2 hover:bg-white transition"
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(lesson._id)} className="rounded-full p-2 hover:bg-white transition">
                  <Trash2 className="size-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {lessons.length === 0 && (
          <div className="glass-card rounded-3xl p-10 text-center text-muted-foreground">
            No lessons yet — add the first one above.
          </div>
        )}
      </div>
    </div>
  );
}
