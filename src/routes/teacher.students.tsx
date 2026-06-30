import { createFileRoute } from "@tanstack/react-router";
import { Search, Mail } from "lucide-react";

export const Route = createFileRoute("/teacher/students")({
  component: Students,
});

const students = [
  { name: "Léa Bensalem", email: "lea@univ.fr", semester: "S2", subjects: ["Algèbre 2", "Analyse 2"] },
  { name: "Adam Khelifi", email: "adam.k@univ.fr", semester: "S1", subjects: ["Algèbre 1", "Analyse 1"] },
  { name: "Sara Marini", email: "sara.m@univ.fr", semester: "S2", subjects: ["Algèbre 2", "Analyse 2"] },
  { name: "Hugo Rambert", email: "hugo.r@univ.fr", semester: "S1", subjects: ["Algèbre 1", "Analyse 1"] },
  { name: "Yasmine Daoud", email: "yasmine.d@univ.fr", semester: "S2", subjects: ["Analyse 2"] },
  { name: "Nathan Roussel", email: "nathan.r@univ.fr", semester: "S1", subjects: ["Algèbre 1"] },
];

function Students() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Students</h1>
          <p className="mt-2 text-muted-foreground">{students.length} registered students.</p>
        </div>
        <div className="relative">
          <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Search students…" className="pl-10 pr-5 py-3 rounded-full glass-panel border border-border focus:outline-none focus:ring-2 focus:ring-ring w-72" />
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="px-6 py-4 grid grid-cols-[1.2fr_1.2fr_auto_1.5fr_auto] gap-6 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
          <div>Student Name</div><div>Email</div><div>Semester</div><div>Registered Subjects</div><div /></div>
        {students.map((s) => (
          <div key={s.email} className="px-6 py-4 grid grid-cols-[1.2fr_1.2fr_auto_1.5fr_auto] gap-6 items-center hover:bg-white/40 transition">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-warm-gradient text-white grid place-items-center font-display font-semibold">
                {s.name[0]}
              </div>
              <span className="font-medium">{s.name}</span>
            </div>
            <span className="text-sm text-muted-foreground truncate">{s.email}</span>
            <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">{s.semester}</span>
            <div className="flex flex-wrap gap-1.5">
              {s.subjects.map((sub) => (
                <span key={sub} className="px-2.5 py-1 rounded-full glass-panel text-xs font-medium">{sub}</span>
              ))}
            </div>
            <button className="rounded-full p-2 hover:bg-white transition"><Mail className="size-4 text-muted-foreground" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
