import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { StudentNav } from "@/components/student-nav";
import { SiteFooter } from "@/components/site-footer";
import { useEffect, useState } from "react";
import { TOKEN_KEY, getAccountType } from "@/lib/api";

export const Route = createFileRoute("/student")({
  component: StudentLayout,
});

function StudentLayout() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      navigate({ to: "/login" });
      return;
    }

    // Teachers log in with the same form, so send them straight to the
    // studio instead of a student view they have no data for.
    if (getAccountType() === "teacher") {
      navigate({ to: "/teacher" });
      return;
    }

    setChecked(true);
  }, []);

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-hero-aura pt-6">
      <StudentNav />
      <main className="mx-auto max-w-7xl px-6 pt-8 pb-16">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
