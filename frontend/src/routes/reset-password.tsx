import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

type ResetPasswordSearch = {
  token: string;
};

export const Route = createFileRoute("/reset-password")({
  // The email link (see email.js's passwordResetEmail) points here as
  // `${APP_URL}/reset-password?token=...`, so the token arrives as a
  // search param rather than a path param.
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Those passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", { token, newPassword });
      setSuccess(data.message || "Password reset successfully. Please log in again.");

      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero-aura px-6 flex items-center justify-center">
      <div className="w-full max-w-lg glass-card rounded-[2rem] p-8 shadow-glow">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="size-14 rounded-2xl bg-warm-gradient grid place-items-center text-white">
            <GraduationCap size={28} />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Reset Password</h1>
          <p className="mt-3 text-muted-foreground">Choose a new password for your account</p>
        </div>

        {!token && (
          <div className="mt-6 rounded-2xl bg-amber-100 text-amber-700 p-4 text-sm">
            This link is missing its reset token. Please use the link from your email, or
            request a new one.
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl bg-red-100 text-red-700 p-4 text-sm">{error}</div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl bg-green-100 text-green-700 p-4 text-sm">
            {success}
          </div>
        )}

        {token && !success && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="newPassword" className="text-sm font-medium mb-1.5 block">
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                className="input w-full"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium mb-1.5 block">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
                className="input w-full"
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-full bg-warm-gradient text-white py-3.5 font-medium shadow-glow hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              Reset password
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          <Link to="/login" className="text-coral font-medium">
            Back to login
          </Link>
        </p>

        <div className="mt-6 flex justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles size={14} />
          Learn smarter with Mathéa
        </div>
      </div>
    </div>
  );
}
