import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/teacher/chapters")({
  component: ChaptersLayout,
});

function ChaptersLayout() {
  return <Outlet />;
}