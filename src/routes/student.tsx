import { createFileRoute, Outlet } from "@tanstack/react-router";
import { StudentNav } from "@/components/student-nav";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/student")({
  component: () => (
    <div className="min-h-screen bg-hero-aura pt-6">
      <StudentNav />
      <main className="mx-auto max-w-7xl px-6 pt-8 pb-16">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  ),
});
