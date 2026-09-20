import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

type Plan = {
  _id: string;
  name: string;
  price: number;
  durationDays: number;
};

function RegisterPage() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<Plan[]>([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    planId: "",
  });

  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchPlans() {
      try {
        // Uses the shared `api` client (baseURL comes from VITE_API_URL)
        // rather than a hardcoded localhost URL, so this also works once
        // deployed and not just in local dev.
        const res = await api.get<Plan[]>("/plans");
        setPlans(res.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load subscription plans.");
      } finally {
        setPlansLoading(false);
      }
    }

    fetchPlans();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);

      setSuccess("Account created! Check your email to verify your account.");

      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2500);
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
          <h1 className="text-4xl font-bold tracking-tight">Create Account</h1>
          <p className="mt-3 text-muted-foreground">Start your Mathéa learning journey</p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-100 text-red-700 p-4 text-sm">{error}</div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl bg-green-100 text-green-700 p-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="firstName" className="text-sm font-medium mb-1.5 block">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              placeholder="Enter your first name"
              value={form.firstName}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="text-sm font-medium mb-1.5 block">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              placeholder="Enter your last name"
              value={form.lastName}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium mb-1.5 block">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="input w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium mb-1.5 block">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
              className="input w-full"
            />
          </div>

          <div>
            <label htmlFor="planId" className="text-sm font-medium mb-1.5 block">
              Choose your pack
            </label>
            <select
              id="planId"
              name="planId"
              value={form.planId}
              onChange={handleChange}
              required
              className="input w-full"
            >
              <option value="">Select a plan</option>
              {plansLoading ? (
                <option disabled>Loading plans...</option>
              ) : (
                plans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name} — {plan.price} TND
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            disabled={loading}
            className="w-full rounded-full bg-warm-gradient text-white py-3.5 font-medium shadow-glow hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            Create Account
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?
          <Link to="/login" className="ml-2 text-coral font-medium">
            Login
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
