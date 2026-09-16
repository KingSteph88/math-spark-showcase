import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-soft-gradient">
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-warm-gradient grid place-items-center text-white shadow-soft">
            <GraduationCap className="size-5" />
          </div>
          <span className="font-display font-semibold text-lg">Mathéa</span>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 Mathéa — Learn mathematics, beautifully.</p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/student" className="hover:text-foreground transition">Student</Link>
          <Link to="/login" className="hover:text-foreground transition">Log in</Link>
        </div>
      </div>
    </footer>
  );
}