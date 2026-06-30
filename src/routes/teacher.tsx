import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TeacherSidebar } from "@/components/teacher-sidebar";

export const Route = createFileRoute("/teacher")({
  component: () => (
    <div className="min-h-screen flex bg-hero-aura">
      <TeacherSidebar />
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  ),
});
