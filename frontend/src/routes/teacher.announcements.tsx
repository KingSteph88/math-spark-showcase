import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Sparkles, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { teacherApi } from "@/lib/teacherApi";

export const Route = createFileRoute("/teacher/announcements")({
  component: Announcements,
});

type Announcement = {
  _id: string;
  title: string;
  content: string;
  isPublished: boolean;
  publishedAt: string;
};

function Announcements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await teacherApi.get("/teacher/announcements");
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function submit(isPublished: boolean) {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await teacherApi.post("/teacher/announcements", { title, content, isPublished });
      setTitle("");
      setContent("");
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await teacherApi.delete(`/teacher/announcements/${id}`);
    load();
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold">Announcements</h1>
        <p className="mt-2 text-muted-foreground">Share updates with your students.</p>
      </div>

      <div className="glass-card rounded-3xl p-8 shadow-soft">
        <div className="flex items-center gap-2 text-xs font-medium text-coral uppercase tracking-wider mb-4">
          <Sparkles className="size-3.5" /> Compose
        </div>
        <input
          placeholder="Announcement title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-5 py-4 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring text-lg font-display font-semibold"
        />
        <textarea
          placeholder="Write a short description for your students…"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-3 w-full px-5 py-4 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            disabled={submitting}
            onClick={() => submit(false)}
            className="rounded-full glass-panel px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            disabled={submitting}
            onClick={() => submit(true)}
            className="rounded-full bg-warm-gradient text-white px-6 py-2.5 text-sm font-medium shadow-soft inline-flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Megaphone className="size-4" />} Publish
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-display font-semibold mb-4">Recent announcements</h2>
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((p) => (
              <div key={p._id} className="glass-card rounded-2xl p-6 hover-lift">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display font-semibold">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.content}</p>
                    {!p.isPublished && (
                      <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium">Draft</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(p.publishedAt).toLocaleDateString()}
                    </span>
                    <button onClick={() => handleDelete(p._id)} className="rounded-full p-2 hover:bg-white transition">
                      <Trash2 className="size-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="glass-card rounded-3xl p-10 text-center text-muted-foreground">No announcements yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
