import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { TeacherSidebar } from "@/components/teacher-sidebar";
import { useEffect, useState } from "react";
import { TOKEN_KEY, getAccountType } from "@/lib/api";

export const Route = createFileRoute("/teacher")({
  component: TeacherLayout,
});

function TeacherLayout() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      navigate({ to: "/login" });
      return;
    }

    // A student who lands here by typing the URL gets sent to their own
    // platform rather than a studio full of failing requests.
    if (getAccountType() !== "teacher") {
      navigate({ to: "/student" });
      return;
    }

    setChecked(true);
  }, []);

  if (!checked) return null;

  return (
    <div className="min-h-screen flex bg-hero-aura">
      <TeacherSidebar />
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
