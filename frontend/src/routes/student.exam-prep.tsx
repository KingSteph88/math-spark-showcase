import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  FileCheck2,
  Trophy,
  Loader2,
  Radio,
  Clock,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/student/exam-prep")({
  component: ExamPrep,
});

type ExamPrepItem = {
  key: string;
  title: string;
  description: string;
  resourceCategory: string;
  count: number;
};

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

const PLATFORM_LABEL: Record<string, string> = {
  google_meet: "Google Meet",
  zoom: "Zoom",
};

const SESSION_COLORS = [
  "from-orange-200 to-pink-200",
  "from-rose-200 to-purple-200",
];

const ICONS: Record<string, any> = {
  midterm_review: ClipboardList,
  mock_exams: FileCheck2,
  final_prep: Trophy,
};

const TONES: Record<string, string> = {
  midterm_review: "from-orange-200 to-pink-200",
  mock_exams: "from-rose-200 to-purple-200",
  final_prep: "from-amber-200 to-rose-200",
};

function ExamPrep() {
  const [items, setItems] = useState<ExamPrepItem[] | null>(null);
  const [sessions, setSessions] = useState<LiveSessionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Live sessions live here now; the Schedule page is for private
        // one-to-one appointments.
        const [overviewRes, sessionsRes] = await Promise.all([
          api.get("/student/exam-prep"),
          api.get("/student/exam-prep/live-sessions"),
        ]);
        setItems(overviewRes.data);
        setSessions(sessionsRes.data);
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
        <h1 className="text-4xl font-bold">Exam Preparation</h1>
        <p className="mt-2 text-muted-foreground">Three structured paths to walk into your exams confident.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {(items ?? []).map((it) => {
          const Icon = ICONS[it.key] ?? ClipboardList;
          return (
            <div key={it.key} className="relative overflow-hidden rounded-3xl glass-card p-8 hover-lift">
              <div
                className={`absolute -top-16 -right-16 size-48 rounded-full bg-gradient-to-br ${TONES[it.key]} blur-2xl opacity-70`}
              />
              <div className="relative">
                <div className="size-12 rounded-2xl bg-warm-gradient grid place-items-center text-white shadow-soft">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-5 text-xl font-display font-semibold">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{it.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{it.count} resources available</p>
                <Link
                  to="/student/resources/$category"
                  params={{ category: it.resourceCategory }}
                  className="mt-6 inline-flex items-center gap-1 text-coral font-medium text-sm hover:gap-2 transition-all"
                >
                  Start preparing <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------- Live sessions ---------------- */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-semibold">Live Sessions</h2>
          <p className="mt-1 text-muted-foreground">
            Join group Q&amp;A and live revision lessons with your instructor.
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
            No live sessions scheduled right now. Check back soon.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-coral via-accent to-transparent" />
            <div className="space-y-6">
              {sessions.map((s, i) => {
                const date = new Date(s.scheduledAt);
                const day = date.toLocaleDateString(undefined, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                });
                const time = date.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div key={s.id} className="relative pl-16">
                    <div className="absolute left-3 top-6 size-7 rounded-full bg-warm-gradient shadow-glow ring-4 ring-background grid place-items-center">
                      <Radio className="size-3.5 text-white" />
                    </div>

                    <div className="glass-card rounded-3xl p-6 hover-lift">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-medium text-coral uppercase tracking-wider">
                            {day}
                          </div>
                          <h3 className="mt-1 text-2xl font-display font-semibold">
                            {s.title}
                          </h3>
                          {s.course && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {s.course.title}
                            </p>
                          )}
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
                          className={`hidden md:block size-20 rounded-2xl bg-gradient-to-br ${
                            SESSION_COLORS[i % SESSION_COLORS.length]
                          } shadow-soft`}
                        />

                        <a
                          href={s.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-warm-gradient text-white px-6 py-3 font-medium shadow-soft inline-flex items-center gap-2"
                        >
                          Join {PLATFORM_LABEL[s.platform] ?? s.platform}{" "}
                          <ExternalLink className="size-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
