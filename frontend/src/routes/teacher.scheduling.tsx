import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarClock,
  Clock,
  Loader2,
  Plus,
  Trash2,
  Check,
  X,
  CalendarOff,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { teacherApi } from "@/lib/teacherApi";

export const Route = createFileRoute("/teacher/scheduling")({
  component: Scheduling,
});

/* ----------------------------- types ----------------------------- */

type Template = {
  _id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  sessionDurationMinutes: number;
  isActive: boolean;
};

type Slot = {
  _id: string;
  startTime: string;
  endTime: string;
  status: "open" | "requested" | "booked" | "cancelled";
};

type BlockedDate = {
  _id: string;
  date: string;
  reason?: string;
};

type Booking = {
  id: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "completed";
  studentNote?: string;
  teacherNote?: string;
  meetingLink?: string | null;
  slot: { id: string; startTime: string; endTime: string } | null;
  student: { firstName: string; lastName: string; email: string } | null;
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SLOT_STATUS: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  requested: "bg-amber-100 text-amber-700",
  booked: "bg-sky-100 text-sky-700",
  cancelled: "bg-slate-100 text-slate-600",
};

const BOOKING_STATUS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  declined: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-100 text-slate-600",
  completed: "bg-slate-100 text-slate-600",
};

function fmtDay(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function fmtTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ----------------------------- page ----------------------------- */

function Scheduling() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [blocked, setBlocked] = useState<BlockedDate[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // new-template form
  const [tpl, setTpl] = useState({
    dayOfWeek: 1,
    startTime: "17:00",
    endTime: "20:00",
    sessionDurationMinutes: 60,
  });

  // day-off form
  const [blockForm, setBlockForm] = useState({ date: "", reason: "" });

  // per-booking accept form (meeting link + note)
  const [respond, setRespond] = useState<
    Record<string, { meetingLink: string; teacherNote: string }>
  >({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [t, s, b, bk] = await Promise.all([
        teacherApi.get("/teacher/scheduling/templates"),
        teacherApi.get("/teacher/scheduling/slots"),
        teacherApi.get("/teacher/scheduling/blocked-dates"),
        teacherApi.get("/teacher/scheduling/bookings"),
      ]);
      setTemplates(t.data);
      setSlots(s.data);
      setBlocked(b.data);
      setBookings(bk.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not load your schedule.");
    } finally {
      setLoading(false);
    }
  }

  /* Wraps every mutation so one failed call can't leave the page stale. */
  async function run(key: string, fn: () => Promise<unknown>, msg?: string) {
    setBusy(key);
    setError("");
    setNotice("");
    try {
      await fn();
      if (msg) setNotice(msg);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  function addTemplate(e: React.FormEvent) {
    e.preventDefault();
    run(
      "tpl",
      () => teacherApi.post("/teacher/scheduling/templates", tpl),
      "Availability added. Generate slots to publish it to students."
    );
  }

  function generate() {
    run(
      "generate",
      async () => {
        const res = await teacherApi.post("/teacher/scheduling/slots/generate", {
          days: 30,
        });
        setNotice(`${res.data.created} new slot(s) published for the next 30 days.`);
      }
    );
  }

  function addBlockedDate(e: React.FormEvent) {
    e.preventDefault();
    if (!blockForm.date) return;
    run(
      "block",
      async () => {
        await teacherApi.post("/teacher/scheduling/blocked-dates", blockForm);
        setBlockForm({ date: "", reason: "" });
      },
      "Day blocked. Open slots on that day were removed."
    );
  }

  function accept(b: Booking) {
    const form = respond[b.id] || { meetingLink: "", teacherNote: "" };
    run(
      b.id,
      () => teacherApi.post(`/teacher/scheduling/bookings/${b.id}/accept`, form),
      "Booking confirmed. The student has been emailed."
    );
  }

  function decline(b: Booking) {
    const form = respond[b.id] || { teacherNote: "" };
    run(
      b.id,
      () =>
        teacherApi.post(`/teacher/scheduling/bookings/${b.id}/decline`, {
          teacherNote: form.teacherNote,
        }),
      "Request declined and the slot reopened."
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const confirmed = bookings.filter((b) => b.status === "accepted");
  const upcomingSlots = slots.filter((s) => s.status !== "cancelled");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Scheduling</h1>
        <p className="mt-2 text-muted-foreground">
          Set your weekly availability and respond to private session requests.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-100 text-red-700 px-5 py-3 text-sm">{error}</div>
      )}
      {notice && (
        <div className="rounded-2xl bg-emerald-100 text-emerald-700 px-5 py-3 text-sm">
          {notice}
        </div>
      )}

      {/* ---------------- Pending requests ---------------- */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold flex items-center gap-2">
          <Inbox className="size-5 text-coral" />
          Requests
          {pending.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
              {pending.length} waiting
            </span>
          )}
        </h2>

        {pending.length === 0 && (
          <div className="glass-card rounded-2xl p-6 text-muted-foreground">
            No requests waiting on you.
          </div>
        )}

        {pending.map((b) => {
          const form = respond[b.id] || { meetingLink: "", teacherNote: "" };
          return (
            <div key={b.id} className="glass-card rounded-3xl p-6 space-y-4">
              <div>
                <h3 className="text-lg font-display font-semibold">
                  {b.student ? `${b.student.firstName} ${b.student.lastName}` : "Student"}
                </h3>
                <p className="text-sm text-muted-foreground">{b.student?.email}</p>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Clock className="size-3.5 text-coral" />
                  {b.slot
                    ? `${fmtDay(b.slot.startTime)} · ${fmtTime(b.slot.startTime)} – ${fmtTime(b.slot.endTime)}`
                    : "—"}
                </div>
                {b.studentNote && (
                  <p className="mt-3 rounded-2xl bg-white/60 border border-border px-4 py-3 text-sm">
                    {b.studentNote}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  placeholder="Meeting link (Google Meet / Zoom)"
                  value={form.meetingLink}
                  onChange={(e) =>
                    setRespond({ ...respond, [b.id]: { ...form, meetingLink: e.target.value } })
                  }
                  className="px-4 py-2.5 rounded-xl bg-white/70 border border-border text-sm"
                />
                <input
                  placeholder="Note to the student (optional)"
                  value={form.teacherNote}
                  onChange={(e) =>
                    setRespond({ ...respond, [b.id]: { ...form, teacherNote: e.target.value } })
                  }
                  className="px-4 py-2.5 rounded-xl bg-white/70 border border-border text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => accept(b)}
                  disabled={busy === b.id}
                  className="rounded-full bg-warm-gradient text-white px-6 py-2.5 text-sm font-medium shadow-soft inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {busy === b.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Accept
                </button>
                <button
                  onClick={() => decline(b)}
                  disabled={busy === b.id}
                  className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-white/60 transition inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <X className="size-4" /> Decline
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* ---------------- Confirmed ---------------- */}
      {confirmed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-display font-semibold">Confirmed sessions</h2>
          {confirmed.map((b) => (
            <div
              key={b.id}
              className="glass-card rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <span className="font-medium">
                  {b.student ? `${b.student.firstName} ${b.student.lastName}` : "Student"}
                </span>
                <span className="text-sm text-muted-foreground ml-3">
                  {b.slot ? `${fmtDay(b.slot.startTime)} · ${fmtTime(b.slot.startTime)}` : "—"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full ${BOOKING_STATUS[b.status]}`}>
                  Confirmed
                </span>
                <button
                  onClick={() =>
                    run(
                      b.id,
                      () =>
                        teacherApi.post(`/teacher/scheduling/bookings/${b.id}/complete`),
                      "Marked as completed."
                    )
                  }
                  disabled={busy === b.id}
                  className="text-xs rounded-full border border-border px-4 py-1.5 hover:bg-white/60 transition disabled:opacity-50"
                >
                  Mark done
                </button>
                <button
                  onClick={() =>
                    run(
                      b.id,
                      () => teacherApi.post(`/teacher/scheduling/bookings/${b.id}/cancel`),
                      "Session cancelled and the slot reopened."
                    )
                  }
                  disabled={busy === b.id}
                  className="text-xs rounded-full border border-border px-4 py-1.5 hover:bg-white/60 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ---------------- Weekly availability ---------------- */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold flex items-center gap-2">
          <CalendarClock className="size-5 text-coral" /> Weekly availability
        </h2>
        <p className="text-sm text-muted-foreground -mt-2">
          These are repeating patterns. Nothing is visible to students until you generate
          slots from them.
        </p>

        <form onSubmit={addTemplate} className="glass-card rounded-3xl p-6 flex flex-wrap gap-3">
          <select
            value={tpl.dayOfWeek}
            onChange={(e) => setTpl({ ...tpl, dayOfWeek: Number(e.target.value) })}
            className="px-4 py-2.5 rounded-xl bg-white/70 border border-border text-sm"
          >
            {DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={tpl.startTime}
            onChange={(e) => setTpl({ ...tpl, startTime: e.target.value })}
            className="px-4 py-2.5 rounded-xl bg-white/70 border border-border text-sm"
          />
          <input
            type="time"
            value={tpl.endTime}
            onChange={(e) => setTpl({ ...tpl, endTime: e.target.value })}
            className="px-4 py-2.5 rounded-xl bg-white/70 border border-border text-sm"
          />
          <select
            value={tpl.sessionDurationMinutes}
            onChange={(e) =>
              setTpl({ ...tpl, sessionDurationMinutes: Number(e.target.value) })
            }
            className="px-4 py-2.5 rounded-xl bg-white/70 border border-border text-sm"
          >
            {[30, 45, 60, 90, 120].map((m) => (
              <option key={m} value={m}>
                {m} min sessions
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy === "tpl"}
            className="rounded-full bg-warm-gradient text-white px-6 py-2.5 text-sm font-medium shadow-soft inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="size-4" /> Add
          </button>
        </form>

        <div className="space-y-2">
          {templates.length === 0 && (
            <div className="glass-card rounded-2xl p-6 text-muted-foreground">
              No availability set yet.
            </div>
          )}
          {templates.map((t) => (
            <div
              key={t._id}
              className="glass-card rounded-2xl px-6 py-4 flex items-center justify-between gap-4"
            >
              <span className="text-sm">
                <span className="font-medium">{DAYS[t.dayOfWeek]}</span>
                <span className="text-muted-foreground ml-3">
                  {t.startTime} – {t.endTime} · {t.sessionDurationMinutes} min
                </span>
              </span>
              <button
                onClick={() =>
                  run(
                    t._id,
                    () => teacherApi.delete(`/teacher/scheduling/templates/${t._id}`),
                    "Availability removed. Booked sessions were kept."
                  )
                }
                disabled={busy === t._id}
                className="text-muted-foreground hover:text-red-600 transition disabled:opacity-50"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={generate}
          disabled={busy === "generate" || templates.length === 0}
          className="rounded-full bg-warm-gradient text-white px-6 py-3 text-sm font-medium shadow-soft inline-flex items-center gap-2 disabled:opacity-50"
        >
          {busy === "generate" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Generate slots for the next 30 days
        </button>
      </section>

      {/* ---------------- Days off ---------------- */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold flex items-center gap-2">
          <CalendarOff className="size-5 text-coral" /> Days off
        </h2>

        <form onSubmit={addBlockedDate} className="glass-card rounded-3xl p-6 flex flex-wrap gap-3">
          <input
            type="date"
            value={blockForm.date}
            onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
            className="px-4 py-2.5 rounded-xl bg-white/70 border border-border text-sm"
          />
          <input
            placeholder="Reason (optional)"
            value={blockForm.reason}
            onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
            className="flex-1 min-w-[12rem] px-4 py-2.5 rounded-xl bg-white/70 border border-border text-sm"
          />
          <button
            type="submit"
            disabled={busy === "block"}
            className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-white/60 transition inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="size-4" /> Block
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {blocked.map((d) => (
            <span
              key={d._id}
              className="glass-card rounded-full px-4 py-2 text-sm inline-flex items-center gap-2"
            >
              {fmtDay(d.date)}
              {d.reason && <span className="text-muted-foreground">· {d.reason}</span>}
              <button
                onClick={() =>
                  run(d._id, () =>
                    teacherApi.delete(`/teacher/scheduling/blocked-dates/${d._id}`)
                  )
                }
                disabled={busy === d._id}
                className="text-muted-foreground hover:text-red-600 transition"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      </section>

      {/* ---------------- Upcoming slots ---------------- */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold">Upcoming slots</h2>

        {upcomingSlots.length === 0 && (
          <div className="glass-card rounded-2xl p-6 text-muted-foreground">
            No slots published yet. Add availability above, then generate slots.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {upcomingSlots.map((s) => (
            <span
              key={s._id}
              className={`rounded-2xl px-4 py-2.5 text-sm inline-flex items-center gap-2 ${SLOT_STATUS[s.status]}`}
            >
              {fmtDay(s.startTime)} · {fmtTime(s.startTime)}
              {s.status === "open" && (
                <button
                  onClick={() =>
                    run(s._id, () => teacherApi.delete(`/teacher/scheduling/slots/${s._id}`))
                  }
                  disabled={busy === s._id}
                  className="hover:text-red-600 transition"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
