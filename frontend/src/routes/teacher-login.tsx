import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { teacherApi } from "@/lib/teacherApi";

export const Route = createFileRoute("/teacher-login")({
  component: TeacherLoginPage,
});

function TeacherLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await teacherApi.post("/teacher-auth/login", form);
      localStorage.setItem("teacherAccessToken", res.data.accessToken);
      localStorage.setItem("teacherRefreshToken", res.data.refreshToken);
      localStorage.setItem("teacherUser", JSON.stringify(res.data.teacher));
      navigate({ to: "/teacher" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero-aura px-6 flex items-center justify-center">
      <div className="w-full max-w-lg glass-card rounded-[2rem] p-8 shadow-glow">
        <div className="flex justify-center mb-6">
          <div className="size-14 rounded-2xl bg-warm-gradient grid place-items-center text-white">
            <GraduationCap size={28} />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Teacher Studio</h1>
          <p className="mt-3 text-muted-foreground">Sign in to manage Mathéa</p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-100 text-red-700 p-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-5 py-4 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-5 py-4 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            disabled={loading}
            className="w-full rounded-full bg-warm-gradient text-white py-3.5 font-medium shadow-glow hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            Login <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
