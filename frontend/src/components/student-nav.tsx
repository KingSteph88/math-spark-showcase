import { Link, useRouterState } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

const nav = [
  { to: "/student", label: "Home" },
  { to: "/student/courses", label: "Courses" },
  { to: "/student/resources", label: "Resources" },
  { to: "/student/exam-prep", label: "Exam Preparation" },
  { to: "/student/schedule", label: "Schedule" },
  { to: "/student/profile", label: "Profile" },
] as const;

export function StudentNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-4 z-40 mx-auto max-w-7xl px-4">
      <nav className="glass-panel rounded-full px-3 py-2 flex items-center justify-between shadow-soft">
        <Link to="/student" className="flex items-center gap-2 pl-3 pr-4">
          <div className="size-8 rounded-xl bg-warm-gradient grid place-items-center text-white">
            <GraduationCap className="size-4" />
          </div>
          <span className="font-display font-semibold">Mathéa</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  active
                    ? "bg-white text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        {/* <Link
          to="/teacher"
          className="rounded-full bg-warm-gradient text-white text-sm font-medium px-5 py-2.5 shadow-soft hover:opacity-90 transition"
        >
          Teacher
        </Link> */}
      </nav>
    </header>
  );
}
