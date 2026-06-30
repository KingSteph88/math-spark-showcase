import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Radio, FileText, TrendingUp, Sparkles, ArrowRight, Calculator } from "lucide-react";

export const Route = createFileRoute("/student/")({
  component: StudentDashboard,
});

function StudentDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-[2rem] glass-card p-8 md:p-12 shadow-soft">
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-warm-gradient opacity-30 blur-3xl" />
        <div className="relative grid md:grid-cols-[1.5fr_1fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 text-xs font-medium mb-4">
              <Sparkles className="size-3 text-coral" /> Continue learning
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Welcome back, <span className="text-gradient">Léa</span></h1>
            <p className="mt-3 text-muted-foreground max-w-lg">
              You're doing great. Pick up where you left off and keep your streak going — small steps, big results.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/student/courses" className="rounded-full bg-warm-gradient text-white px-6 py-3 font-medium shadow-soft inline-flex items-center gap-2">
                Resume learning <ArrowRight className="size-4" />
              </Link>
              <Link to="/student/schedule" className="rounded-full glass-card px-6 py-3 font-medium">
                Next live session
              </Link>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-warm-gradient rounded-full opacity-40 blur-2xl" />
              <div className="relative size-56 rounded-[2rem] glass-panel grid place-items-center shadow-glow">
                <Calculator className="size-24 text-coral" strokeWidth={1.2} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: "Active chapters", value: "5" },
          { icon: TrendingUp, label: "Progress", value: "62%" },
          { icon: Radio, label: "Next live", value: "Wed 20:00" },
          { icon: FileText, label: "Resources saved", value: "12" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-5 hover-lift">
            <div className="size-9 rounded-xl bg-warm-gradient grid place-items-center text-white mb-3">
              <s.icon className="size-4" />
            </div>
            <div className="text-2xl font-display font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Continue */}
      <div className="grid lg:grid-cols-3 gap-4">
        {[
          { title: "Limites et Continuité", subject: "Analyse 1", progress: 70 },
          { title: "Espaces Vectoriels", subject: "Algèbre 1", progress: 45 },
          { title: "Développements Limités", subject: "Analyse 1", progress: 20 },
        ].map((c) => (
          <div key={c.title} className="glass-card rounded-2xl p-6 hover-lift">
            <div className="text-xs text-coral font-medium uppercase tracking-wider">{c.subject}</div>
            <h3 className="mt-1 font-display font-semibold text-lg">{c.title}</h3>
            <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-warm-gradient" style={{ width: `${c.progress}%` }} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{c.progress}% complete</div>
          </div>
        ))}
      </div>
    </div>
  );
}
