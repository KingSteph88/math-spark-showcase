import { createFileRoute } from "@tanstack/react-router";
import { Mail, GraduationCap, Calendar, Award } from "lucide-react";

export const Route = createFileRoute("/student/profile")({
  component: Profile,
});

function Profile() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] glass-card p-10 shadow-soft">
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-warm-gradient opacity-30 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="size-24 rounded-3xl bg-warm-gradient grid place-items-center text-white text-3xl font-display font-bold shadow-glow">
            L
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Léa Bensalem</h1>
            <p className="text-muted-foreground mt-1">First-year university student · Semester 2</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full glass-panel text-xs font-medium">Algèbre 2</span>
              <span className="px-3 py-1 rounded-full glass-panel text-xs font-medium">Analyse 2</span>
            </div>
          </div>
          <button className="rounded-full bg-warm-gradient text-white px-6 py-3 font-medium shadow-soft">Edit profile</button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Mail, label: "Email", value: "lea@univ.fr" },
          { icon: GraduationCap, label: "Year", value: "L1 — Maths" },
          { icon: Calendar, label: "Joined", value: "Sep 2025" },
          { icon: Award, label: "Streak", value: "12 days" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-5 hover-lift">
            <div className="size-9 rounded-xl bg-warm-gradient grid place-items-center text-white mb-3">
              <s.icon className="size-4" />
            </div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="font-display font-semibold mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
