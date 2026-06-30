import { createFileRoute } from "@tanstack/react-router";
import { Radio, Clock, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/student/schedule")({
  component: Schedule,
});

const sessions = [
  { day: "Wednesday", subject: "Analysis", time: "20:00", platform: "Discord", color: "from-orange-200 to-pink-200", url: "#" },
  { day: "Friday", subject: "Algebra", time: "18:00", platform: "Google Meet", color: "from-rose-200 to-purple-200", url: "#" },
];

function Schedule() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Live Sessions</h1>
        <p className="mt-2 text-muted-foreground">Join weekly Q&A and live lessons with your instructor.</p>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-coral via-accent to-transparent" />
        <div className="space-y-6">
          {sessions.map((s) => (
            <div key={s.day} className="relative pl-16">
              <div className="absolute left-3 top-6 size-7 rounded-full bg-warm-gradient shadow-glow ring-4 ring-background grid place-items-center">
                <Radio className="size-3.5 text-white" />
              </div>
              <div className="glass-card rounded-3xl p-6 hover-lift">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium text-coral uppercase tracking-wider">{s.day}</div>
                    <h3 className="mt-1 text-2xl font-display font-semibold">{s.subject}</h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" /> {s.time}</span>
                      <span>·</span>
                      <span>{s.platform}</span>
                    </div>
                  </div>
                  <div className={`hidden md:block size-20 rounded-2xl bg-gradient-to-br ${s.color} shadow-soft`} />
                  <a href={s.url} className="rounded-full bg-warm-gradient text-white px-6 py-3 font-medium shadow-soft inline-flex items-center gap-2">
                    Join {s.platform} <ExternalLink className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
