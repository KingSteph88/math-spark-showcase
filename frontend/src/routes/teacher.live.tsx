import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { teacherApi } from "@/lib/teacherApi";

export const Route = createFileRoute("/teacher/live")({
  component: TeacherLive,
});

type Session = {
  _id: string;
  title: string;
  scheduledAt: string;
  platform: string;
  meetingLink: string;
  status: string;
};

function TeacherLive() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", scheduledAt: "", meetingLink: "", platform: "google_meet" });

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    try {
      const res = await teacherApi.get("/teacher/live-sessions");
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await teacherApi.post("/teacher/live-sessions", {
      ...form,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
    });
    setForm({ title: "", scheduledAt: "", meetingLink: "", platform: "google_meet" });
    setShowForm(false);
    loadSessions();
  }

  async function handleDelete(id: string) {
    await teacherApi.delete(`/teacher/live-sessions/${id}`);
    loadSessions();
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Live Sessions</h1>
          <p className="mt-2 text-muted-foreground">Schedule and manage upcoming live sessions.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-warm-gradient text-white px-6 py-3 font-medium shadow-soft inline-flex items-center gap-2"
        >
          <Plus className="size-4" /> New session
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card rounded-3xl p-6 grid sm:grid-cols-2 gap-3">
          <input
            placeholder="Title (e.g. Analyse 1)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="px-4 py-3 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
            required
            className="px-4 py-3 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            placeholder="Meeting link"
            value={form.meetingLink}
            onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
            required
            className="px-4 py-3 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <select
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            className="px-4 py-3 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            <option value="google_meet">Google Meet</option>
            <option value="zoom">Zoom</option>
          </select>
          <button className="sm:col-span-2 rounded-full bg-warm-gradient text-white py-3 text-sm font-medium shadow-soft">
            Create session
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="px-6 py-4 grid grid-cols-[1fr_1fr_auto_auto] gap-6 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
            <div>Course</div><div>Date</div><div>Platform</div><div>Actions</div>
          </div>
          {sessions.map((s) => (
            <div key={s._id} className="px-6 py-4 grid grid-cols-[1fr_1fr_auto_auto] gap-6 items-center hover:bg-white/40 transition">
              <div className="font-medium">{s.title}</div>
              <div className="text-sm text-muted-foreground">{new Date(s.scheduledAt).toLocaleString()}</div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-pink-100 w-fit">
                {s.platform}
              </span>
              <button onClick={() => handleDelete(s._id)} className="rounded-full p-2 hover:bg-white transition">
                <Trash2 className="size-4 text-muted-foreground" />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="px-6 py-10 text-center text-muted-foreground">No live sessions scheduled.</div>
          )}
        </div>
      )}
    </div>
  );
}
