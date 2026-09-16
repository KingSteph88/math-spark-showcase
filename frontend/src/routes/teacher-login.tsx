import { createFileRoute, Navigate } from "@tanstack/react-router";

/**
 * There is no separate teacher login any more — teachers and students
 * sign in at /login and are routed by their account type. This route is
 * kept only so old bookmarks and the 401 redirect from earlier builds
 * don't dead-end.
 */
export const Route = createFileRoute("/teacher-login")({
  component: () => <Navigate to="/login" replace />,
});
