import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarClock, Clock, ExternalLink, Loader2, Check, X } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/student/schedule")({
  component: Schedule,
});

type Slot = {
  id: string;
  startTime: string;
  endTime: string;
  teacher: { id: string; firstName: string; lastName: string } | null;
};

type Booking = {
  id: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "completed";
  studentNote?: string;
  teacherNote?: string;
  meetingLink?: string | null;
  slot: { id: string; startTime: string; endTime: string } | null;
  teacher: { firstName: string; lastName: string } | null;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  declined: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-100 text-slate-600",
  completed: "bg-slate-100 text-slate-600",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting confirmation",
  accepted: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
  completed: "Completed",
};

function formatDay(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Schedule() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [slotsRes, bookingsRes] = await Promise.all([
        api.get("/student/schedule/slots"),
        api.get("/student/schedule/bookings"),
      ]);
      setSlots(slotsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function requestSlot(slotId: string) {
    setSubmitting(slotId);
    setError("");
    try {
      await api.post("/student/schedule/bookings", { slotId, studentNote: note });
      setNote("");
      setSelected(null);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not request that slot.");
    } finally {
      setSubmitting(null);
    }
  }

  async function cancel(bookingId: string) {
    setSubmitting(bookingId);
    try {
      await api.post(`/student/schedule/bookings/${bookingId}/cancel`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not cancel that booking.");
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // Group open slots by calendar day so the list reads like a diary.
  const slotsByDay = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const key = formatDay(slot.startTime);
    (acc[key] ||= []).push(slot);
    return acc;
  }, {});

  const activeBookings = bookings.filter((b) =>
    ["pending", "accepted"].includes(b.status)
  );
  const pastBookings = bookings.filter(
    (b) => !["pending", "accepted"].includes(b.status)
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Schedule</h1>
        <p className="mt-2 text-muted-foreground">
          Book a private one-to-one appointment with your teacher.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-100 text-red-700 p-4 text-sm">{error}</div>
      )}

      {/* ---------------- Your appointments ---------------- */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold">Your appointments</h2>

        {activeBookings.length === 0 && (
          <div className="glass-card rounded-2xl p-6 text-muted-foreground">
            You have no upcoming appointments. Pick a time below to request one.
          </div>
        )}

        {activeBookings.map((b) => (
          <div key={b.id} className="glass-card rounded-3xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[b.status]}`}
                >
                  {STATUS_LABEL[b.status]}
                </span>
                <h3 className="mt-2 text-xl font-display font-semibold">
                  {b.slot ? formatDay(b.slot.startTime) : "—"}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  {b.slot ? `${formatTime(b.slot.startTime)} – ${formatTime(b.slot.endTime)}` : "—"}
                  {b.teacher && (
                    <>
                      <span>·</span>
                      <span>
                        {b.teacher.firstName} {b.teacher.lastName}
                      </span>
                    </>
                  )}
                </div>
                {b.teacherNote && (
                  <p className="mt-2 text-sm text-muted-foreground">{b.teacherNote}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {b.status === "accepted" && b.meetingLink && (
                  <a
                    href={b.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-warm-gradient text-white px-6 py-3 font-medium shadow-soft inline-flex items-center gap-2"
                  >
                    Join <ExternalLink className="size-4" />
                  </a>
                )}
                <button
                  onClick={() => cancel(b.id)}
                  disabled={submitting === b.id}
                  className="rounded-full border border-border px-5 py-3 text-sm hover:bg-white/60 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ---------------- Available times ---------------- */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold">Available times</h2>

        {slots.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
            No open appointment slots right now. Check back soon.
          </div>
        )}

        {Object.entries(slotsByDay).map(([day, daySlots]) => (
          <div key={day} className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-coral uppercase tracking-wider">
              <CalendarClock className="size-4" /> {day}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {daySlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelected(selected === slot.id ? null : slot.id)}
                  className={`rounded-2xl border px-5 py-3 text-sm transition ${
                    selected === slot.id
                      ? "border-coral bg-white shadow-soft"
                      : "border-border bg-white/60 hover:bg-white"
                  }`}
                >
                  {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                </button>
              ))}
            </div>

            {daySlots.some((s) => s.id === selected) && (
              <div className="mt-4 space-y-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What would you like to cover? (optional)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => requestSlot(selected!)}
                    disabled={submitting === selected}
                    className="rounded-full bg-warm-gradient text-white px-6 py-3 text-sm font-medium shadow-soft inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting === selected ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    Request this time
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-full border border-border px-5 py-3 text-sm hover:bg-white/60 transition inline-flex items-center gap-2"
                  >
                    <X className="size-4" /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ---------------- History ---------------- */}
      {pastBookings.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-display font-semibold">Past requests</h2>
          {pastBookings.map((b) => (
            <div
              key={b.id}
              className="glass-card rounded-2xl px-6 py-4 flex items-center justify-between gap-4"
            >
              <span className="text-sm">
                {b.slot ? `${formatDay(b.slot.startTime)} · ${formatTime(b.slot.startTime)}` : "—"}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[b.status]}`}
              >
                {STATUS_LABEL[b.status]}
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
