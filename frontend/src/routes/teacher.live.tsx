import { createFileRoute } from "@tanstack/react-router";
import { Edit, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/teacher/live")({
  component: TeacherLive,
});

const sessions = [
  { course: "Analyse 1", date: "Mar 13, 2026", hour: "20:00", platform: "Discord" },
  { course: "Algèbre 1", date: "Mar 15, 2026", hour: "18:00", platform: "Google Meet" },
  { course: "Analyse 2", date: "Mar 20, 2026", hour: "20:00", platform: "Discord" },
  { course: "Algèbre 2", date: "Mar 22, 2026", hour: "18:00", platform: "Google Meet" },
];

function TeacherLive() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Live Sessions</h1>
          <p className="mt-2 text-muted-foreground">Schedule and manage upcoming live sessions.</p>
        </div>
        <button className="rounded-full bg-warm-gradient text-white px-6 py-3 font-medium shadow-soft inline-flex items-center gap-2">
          <Plus className="size-4" /> New session
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="px-6 py-4 grid grid-cols-[1fr_1fr_auto_1fr_auto] gap-6 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
          <div>Course</div><div>Date</div><div>Hour</div><div>Platform</div><div>Actions</div>
        </div>
        {sessions.map((s, i) => (
          <div key={i} className="px-6 py-4 grid grid-cols-[1fr_1fr_auto_1fr_auto] gap-6 items-center hover:bg-white/40 transition">
            <div className="font-medium">{s.course}</div>
            <div className="text-sm text-muted-foreground">{s.date}</div>
            <div className="text-sm text-muted-foreground">{s.hour}</div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                s.platform === "Discord"
                  ? "bg-gradient-to-r from-orange-100 to-pink-100"
                  : "bg-gradient-to-r from-rose-100 to-purple-100"
              }`}>{s.platform}</span>
            </div>
            <div className="flex gap-1">
              <button className="rounded-full p-2 hover:bg-white transition"><Edit className="size-4 text-muted-foreground" /></button>
              <button className="rounded-full p-2 hover:bg-white transition"><Trash2 className="size-4 text-muted-foreground" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
