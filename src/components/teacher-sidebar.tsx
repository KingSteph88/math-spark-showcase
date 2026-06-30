import { Link, useRouterState } from "@tanstack/react-router";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Layers,
  FileText,
  Radio,
  Megaphone,
  Users,
  ArrowLeft,
} from "lucide-react";

const items = [
  { to: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { to: "/teacher/courses", label: "Courses", icon: BookOpen },
  { to: "/teacher/chapters", label: "Chapters", icon: Layers },
  { to: "/teacher/resources", label: "Resources", icon: FileText },
  { to: "/teacher/live", label: "Live Sessions", icon: Radio },
  { to: "/teacher/announcements", label: "Announcements", icon: Megaphone },
  { to: "/teacher/students", label: "Students", icon: Users },
] as const;

export function TeacherSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-2 p-6 border-r border-border/60 bg-soft-gradient min-h-screen">
      <Link to="/teacher" className="flex items-center gap-2 px-3 py-3 mb-4">
        <div className="size-9 rounded-xl bg-warm-gradient grid place-items-center text-white shadow-soft">
          <GraduationCap className="size-5" />
        </div>
        <div>
          <div className="font-display font-semibold leading-tight">Mathéa</div>
          <div className="text-xs text-muted-foreground">Teacher Studio</div>
        </div>
      </Link>
      <nav className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition ${
                active
                  ? "bg-white text-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <Link
        to="/"
        className="mt-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-3"
      >
        <ArrowLeft className="size-4" /> Back to landing
      </Link>
    </aside>
  );
}
