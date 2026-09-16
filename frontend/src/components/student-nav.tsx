import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { GraduationCap, LogOut } from "lucide-react";
import { api } from "@/lib/api";

const nav = [
  { to: "/student", label: "Home" },
  { to: "/student/courses", label: "Courses" },
  { to: "/student/resources", label: "Resources" },
  { to: "/student/exam-prep", label: "Exam Preparation" },
  { to: "/student/schedule", label: "Book a Session" },
  { to: "/student/profile", label: "Profile" },
] as const;

export function StudentNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  async function handleLogout() {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      navigate({ to: "/login" });
    }
  }

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
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 mr-1 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/60 transition"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </nav>
    </header>
  );
}