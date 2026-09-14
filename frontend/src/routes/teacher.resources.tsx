import { createFileRoute } from "@tanstack/react-router";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { teacherApi } from "@/lib/teacherApi";

export const Route = createFileRoute("/teacher/resources")({
  component: TeacherResources,
});

const CATEGORIES = ["formula_sheet", "course_summary", "exercise_series", "previous_exam", "correction"] as const;

type ResourceItem = {
  _id: string;
  title: string;
  category: string;
  fileSizeBytes?: number;
  createdAt: string;
};

function formatSize(bytes?: number) {
  if (!bytes) return "—";
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function TeacherResources() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("formula_sheet");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    setLoading(true);
    try {
      const res = await teacherApi.get("/teacher/resources");
      setResources(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("category", category);

    setUploading(true);
    try {
      await teacherApi.post("/teacher/resources", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTitle("");
      setFile(null);
      (document.getElementById("resource-file-input") as HTMLInputElement).value = "";
      loadResources();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    await teacherApi.delete(`/teacher/resources/${id}`);
    loadResources();
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-4xl font-bold">Resources</h1>
        <p className="mt-2 text-muted-foreground">Manage every uploaded PDF and document.</p>
      </div>

      <form onSubmit={handleUpload} className="glass-card rounded-3xl p-6 grid sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
        <input
          placeholder="Resource title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-4 py-3 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="px-4 py-3 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.replace("_", " ")}</option>
          ))}
        </select>
        <input
          id="resource-file-input"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm"
        />
        <button
          disabled={uploading}
          className="rounded-full bg-warm-gradient text-white px-6 py-3 text-sm font-medium shadow-soft inline-flex items-center gap-2 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="px-6 py-4 grid grid-cols-[1fr_auto_auto_auto_auto] gap-6 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
            <div>File</div><div>Category</div><div>Size</div><div>Date</div><div /></div>
          {resources.map((f) => (
            <div key={f._id} className="px-6 py-4 grid grid-cols-[1fr_auto_auto_auto_auto] gap-6 items-center hover:bg-white/40 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-gradient-to-br from-orange-200 to-pink-200 grid place-items-center shrink-0">
                  <FileText className="size-5 text-coral" />
                </div>
                <span className="font-medium truncate">{f.title}</span>
              </div>
              <span className="text-sm text-muted-foreground">{f.category.replace("_", " ")}</span>
              <span className="text-sm text-muted-foreground">{formatSize(f.fileSizeBytes)}</span>
              <span className="text-sm text-muted-foreground">{new Date(f.createdAt).toLocaleDateString()}</span>
              <button onClick={() => handleDelete(f._id)} className="rounded-full p-2 hover:bg-white transition">
                <Trash2 className="size-4 text-muted-foreground" />
              </button>
            </div>
          ))}
          {resources.length === 0 && (
            <div className="px-6 py-10 text-center text-muted-foreground">No resources uploaded yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
