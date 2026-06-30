import { createFileRoute } from "@tanstack/react-router";
import { Users, Layers, FileText, Radio, TrendingUp, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/teacher/")({
  component: TeacherDashboard,
});

const stats = [
  { icon: Users, label: "Total Students", value: "248", trend: "+12 this week", color: "from-orange-200 to-pink-200" },
  { icon: Layers, label: "Total Chapters", value: "14", trend: "All published", color: "from-rose-200 to-purple-200" },
  { icon: FileText, label: "Uploaded Resources", value: "86", trend: "+5 this week", color: "from-amber-200 to-rose-200" },
  { icon: Radio, label: "Upcoming Live Sessions", value: "2", trend: "Next: Wed 20:00", color: "from-fuchsia-200 to-orange-200" },
];

function TeacherDashboard() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Welcome back. Here's what's happening on Mathéa.</p>
        </div>
        <button className="rounded-full bg-warm-gradient text-white px-6 py-3 font-medium shadow-soft">+ New announcement</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="relative overflow-hidden glass-card rounded-3xl p-6 hover-lift">
            <div className={`absolute -top-12 -right-12 size-32 rounded-full bg-gradient-to-br ${s.color} blur-2xl opacity-60`} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="size-10 rounded-xl bg-warm-gradient grid place-items-center text-white shadow-soft">
                  <s.icon className="size-5" />
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-4 text-3xl font-display font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="mt-3 inline-flex items-center gap-1 text-xs text-coral font-medium">
                <TrendingUp className="size-3" /> {s.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-3xl p-6">
          <h3 className="font-display font-semibold text-lg">Recent activity</h3>
          <div className="mt-4 space-y-3">
            {[
              { who: "Léa B.", what: "completed Limites et Continuité", when: "2h ago" },
              { who: "Adam K.", what: "downloaded Formula Sheet — Algèbre 1", when: "4h ago" },
              { who: "Sara M.", what: "joined live session Analysis", when: "yesterday" },
              { who: "Hugo R.", what: "submitted exercises — Espaces Vectoriels", when: "yesterday" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-4 glass-panel rounded-2xl p-4">
                <div className="size-10 rounded-xl bg-warm-gradient text-white grid place-items-center font-display font-semibold">
                  {a.who[0]}
                </div>
                <div className="flex-1 text-sm">
                  <span className="font-semibold">{a.who}</span>{" "}
                  <span className="text-muted-foreground">{a.what}</span>
                </div>
                <span className="text-xs text-muted-foreground">{a.when}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h3 className="font-display font-semibold text-lg">Upcoming live</h3>
          <div className="mt-4 space-y-3">
            {[
              { day: "Wed", time: "20:00", subject: "Analysis", platform: "Discord" },
              { day: "Fri", time: "18:00", subject: "Algebra", platform: "Google Meet" },
            ].map((s) => (
              <div key={s.day} className="glass-panel rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-warm-gradient text-white grid place-items-center font-display font-bold">
                    {s.day}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{s.subject}</div>
                    <div className="text-xs text-muted-foreground">{s.time} · {s.platform}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
