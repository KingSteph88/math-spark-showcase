import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // The backend always replies with the same generic message whether
      // or not that email exists, so this response never confirms or
      // denies a given address is registered.
      const { data } = await api.post("/auth/forgot-password", { email });
      setSuccess(data.message || "If an account exists for that email, a reset link has been sent.");
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
          <h1 className="text-4xl font-bold tracking-tight">Forgot Password</h1>
          <p className="mt-3 text-muted-foreground">
            Enter your email and we'll send you a link to reset it.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-100 text-red-700 p-4 text-sm">{error}</div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl bg-green-100 text-green-700 p-4 text-sm">
            {success}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="text-sm font-medium mb-1.5 block">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input w-full"
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-full bg-warm-gradient text-white py-3.5 font-medium shadow-glow hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              Send reset link
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          Remembered your password?
          <Link to="/login" className="ml-2 text-coral font-medium">
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
