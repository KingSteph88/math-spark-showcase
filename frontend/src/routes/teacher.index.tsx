import { createFileRoute } from "@tanstack/react-router";
import { Users, Layers, FileText, Radio, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { teacherApi } from "@/lib/teacherApi";

export const Route = createFileRoute("/teacher/")({
  component: TeacherDashboard,
});

type Stats = { totalStudents: number; totalChapters: number; totalResources: number; upcomingLiveSessions: number };
type Activity = { type: string; studentName: string; detail: string; at: string };
type LiveSession = { _id: string; title: string; scheduledAt: string; platform: string };

function TeacherDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [upcoming, setUpcoming] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, activityRes, upcomingRes] = await Promise.all([
          teacherApi.get("/teacher/dashboard/stats"),
          teacherApi.get("/teacher/dashboard/activity"),
          teacherApi.get("/teacher/dashboard/upcoming-live"),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
        setUpcoming(upcomingRes.data);
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

  const cards = stats
    ? [
        { icon: Users, label: "Total Students", value: stats.totalStudents },
        { icon: Layers, label: "Total Chapters", value: stats.totalChapters },
        { icon: FileText, label: "Uploaded Resources", value: stats.totalResources },
        { icon: Radio, label: "Upcoming Live Sessions", value: stats.upcomingLiveSessions },
      ]
    : [];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome back. Here's what's happening on Mathéa.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((s) => (
          <div key={s.label} className="glass-card rounded-3xl p-6 hover-lift">
            <div className="size-10 rounded-xl bg-warm-gradient grid place-items-center text-white shadow-soft">
              <s.icon className="size-5" />
            </div>
            <div className="mt-4 text-3xl font-display font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-3xl p-6">
          <h3 className="font-display font-semibold text-lg">Recent activity</h3>
          <div className="mt-4 space-y-3">
            {activity.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
            {activity.map((a, i) => (
              <div key={i} className="flex items-center gap-4 glass-panel rounded-2xl p-4">
                <div className="size-10 rounded-xl bg-warm-gradient text-white grid place-items-center font-display font-semibold">
                  {a.studentName[0]}
                </div>
                <div className="flex-1 text-sm">
                  <span className="font-semibold">{a.studentName}</span>{" "}
                  <span className="text-muted-foreground">completed {a.detail}</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(a.at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h3 className="font-display font-semibold text-lg">Upcoming live</h3>
          <div className="mt-4 space-y-3">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nothing scheduled.</p>}
            {upcoming.map((s) => (
              <div key={s._id} className="glass-panel rounded-2xl p-4">
                <div className="font-semibold">{s.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(s.scheduledAt).toLocaleString()} · {s.platform}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
