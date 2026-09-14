import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { TeacherSidebar } from "@/components/teacher-sidebar";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/teacher")({
  component: TeacherLayout,
});

function TeacherLayout() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("teacherAccessToken");
    if (!token) {
      navigate({ to: "/teacher-login" });
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
