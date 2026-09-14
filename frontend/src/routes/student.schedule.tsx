import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Radio, Clock, ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/student/schedule")({
  component: Schedule,
});

type LiveSessionItem = {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
  platform: "google_meet" | "zoom";
  meetingLink: string;
  status: string;
  teacher: { firstName: string; lastName: string } | null;
  course: { id: string; title: string } | null;
};

const COLORS = ["from-orange-200 to-pink-200", "from-rose-200 to-purple-200"];
const PLATFORM_LABEL: Record<string, string> = {
  google_meet: "Google Meet",
  zoom: "Zoom",
};

function Schedule() {
  const [sessions, setSessions] = useState<LiveSessionItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/student/schedule");
        setSessions(res.data);
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

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Live Sessions</h1>
        <p className="mt-2 text-muted-foreground">Join weekly Q&A and live lessons with your instructor.</p>
      </div>

      {sessions && sessions.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
          No live sessions scheduled right now. Check back soon.
        </div>
      )}

      <div className="relative">
        <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-coral via-accent to-transparent" />
        <div className="space-y-6">
          {(sessions ?? []).map((s, i) => {
            const date = new Date(s.scheduledAt);
            const day = date.toLocaleDateString(undefined, { weekday: "long" });
            const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
            return (
              <div key={s.id} className="relative pl-16">
                <div className="absolute left-3 top-6 size-7 rounded-full bg-warm-gradient shadow-glow ring-4 ring-background grid place-items-center">
                  <Radio className="size-3.5 text-white" />
                </div>
                <div className="glass-card rounded-3xl p-6 hover-lift">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-medium text-coral uppercase tracking-wider">{day}</div>
                      <h3 className="mt-1 text-2xl font-display font-semibold">
                        {s.course?.title ?? s.title}
                      </h3>
                      {s.course && <p className="text-sm text-muted-foreground mt-0.5">{s.title}</p>}
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5" /> {time}
                        </span>
                        <span>·</span>
                        <span>{PLATFORM_LABEL[s.platform] ?? s.platform}</span>
                        {s.teacher && (
                          <>
                            <span>·</span>
                            <span>
                              {s.teacher.firstName} {s.teacher.lastName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div
                      className={`hidden md:block size-20 rounded-2xl bg-gradient-to-br ${COLORS[i % COLORS.length]} shadow-soft`}
                    />
                    <a
                      href={s.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-warm-gradient text-white px-6 py-3 font-medium shadow-soft inline-flex items-center gap-2"
                    >
                      Join {PLATFORM_LABEL[s.platform] ?? s.platform} <ExternalLink className="size-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
