import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Sparkles } from "lucide-react";

export const Route = createFileRoute("/teacher/announcements")({
  component: Announcements,
});

const past = [
  { title: "Mock exam scheduled next Friday", desc: "Don't forget — a full mock midterm will be held on Friday at 18:00 on Google Meet.", date: "2 days ago" },
  { title: "New PDF: Développements Limités", desc: "A condensed summary is now available in the Resources section.", date: "5 days ago" },
];

function Announcements() {
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
          className="w-full px-5 py-4 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring text-lg font-display font-semibold"
        />
        <textarea
          placeholder="Write a short description for your students…"
          rows={5}
          className="mt-3 w-full px-5 py-4 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-full glass-panel px-5 py-2.5 text-sm font-medium">Save draft</button>
          <button className="rounded-full bg-warm-gradient text-white px-6 py-2.5 text-sm font-medium shadow-soft inline-flex items-center gap-2">
            <Megaphone className="size-4" /> Publish
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-display font-semibold mb-4">Recent announcements</h2>
        <div className="space-y-3">
          {past.map((p, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 hover-lift">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{p.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
