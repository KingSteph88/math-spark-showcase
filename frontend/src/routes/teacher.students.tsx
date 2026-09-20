import { createFileRoute } from "@tanstack/react-router";
import { Search, Loader2, Check, Ban, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { teacherApi } from "@/lib/teacherApi";

export const Route = createFileRoute("/teacher/students")({
  component: Students,
});

type Plan = {
  _id: string;
  name: string;
  price: number;
  durationDays: number;
};

type Student = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  subscription?: {
    planId?: Plan | null;
    status: string;
    startDate?: string;
    endDate?: string;
  };
};

const STATUS_STYLES: Record<string, string> = {
  pending_email_verification: "bg-slate-100 text-slate-600",
  pending_approval: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-rose-100 text-rose-700",
  expired: "bg-slate-100 text-slate-600",
};

function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadStudents();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function loadStudents() {
    setLoading(true);
    try {
      const res = await teacherApi.get("/teacher/students", { params: { search } });
      setStudents(res.data.students);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function runAction(id: string, action: "approve" | "suspend" | "activate") {
    setActioningId(id);
    setError("");
    try {
      await teacherApi.patch(`/teacher/students/${id}/${action}`);
      await loadStudents();
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not update this student.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Students</h1>
          <p className="mt-2 text-muted-foreground">{total} registered students.</p>
        </div>
        <div className="relative">
          <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search students…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-5 py-3 rounded-full glass-panel border border-border focus:outline-none focus:ring-2 focus:ring-ring w-72"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-100 text-red-700 p-4 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="px-6 py-4 grid grid-cols-[1.2fr_1.2fr_1fr_auto_auto] gap-6 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
            <div>Student Name</div>
            <div>Email</div>
            <div>Plan</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {students.map((s) => (
            <div
              key={s._id}
              className="px-6 py-4 grid grid-cols-[1.2fr_1.2fr_1fr_auto_auto] gap-6 items-center hover:bg-white/40 transition"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-warm-gradient text-white grid place-items-center font-display font-semibold">
                  {s.firstName[0]}
                </div>
                <span className="font-medium">
                  {s.firstName} {s.lastName}
                </span>
              </div>

              <span className="text-sm text-muted-foreground truncate">{s.email}</span>

              <div className="flex flex-col">
                <span className="text-sm font-medium">{s.subscription?.planId?.name ?? "—"}</span>
                {s.subscription?.endDate && (
                  <span className="text-xs text-muted-foreground">
                    until {new Date(s.subscription.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                  STATUS_STYLES[s.status] ?? "bg-secondary"
                }`}
              >
                {s.status.replace(/_/g, " ")}
              </span>

              <div className="flex gap-2">
                {s.status === "pending_approval" && (
                  <button
                    onClick={() => runAction(s._id, "approve")}
                    disabled={actioningId === s._id}
                    className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-2 text-xs font-medium hover:bg-emerald-200 transition inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {actioningId === s._id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    Approve
                  </button>
                )}
                {s.status === "active" && (
                  <button
                    onClick={() => runAction(s._id, "suspend")}
                    disabled={actioningId === s._id}
                    className="rounded-full bg-rose-100 text-rose-700 px-3 py-2 text-xs font-medium hover:bg-rose-200 transition inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {actioningId === s._id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Ban className="size-3.5" />
                    )}
                    Suspend
                  </button>
                )}
                {["suspended", "expired"].includes(s.status) && (
                  <button
                    onClick={() => runAction(s._id, "activate")}
                    disabled={actioningId === s._id}
                    className="rounded-full glass-panel px-3 py-2 text-xs font-medium hover:bg-white transition inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    {actioningId === s._id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="size-3.5" />
                    )}
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="px-6 py-10 text-center text-muted-foreground">No students found.</div>
          )}
        </div>
      )}
    </div>
  );
}