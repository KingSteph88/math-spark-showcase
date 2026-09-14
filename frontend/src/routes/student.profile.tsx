import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Calendar, Award, Loader2, Phone } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/student/profile")({
  component: Profile,
});

type ProfileData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  status: string;
  subscription?: {
    planId?: { name?: string; price?: number; durationDays?: number; type?: string };
    status?: string;
    endDate?: string;
  };
  joinedAt: string;
  stats: {
    completedLessons: number;
    enrolledCourses: { id: string; title: string }[];
  };
};

function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/student/profile");
        setProfile(res.data);
        setForm({
          firstName: res.data.firstName ?? "",
          lastName: res.data.lastName ?? "",
          phone: res.data.phone ?? "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/student/profile", form);
      setProfile((prev) => (prev ? { ...prev, ...res.data } : prev));
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center text-muted-foreground py-10">Couldn't load your profile.</div>;
  }

  const initial = profile.firstName?.[0]?.toUpperCase() ?? "?";
  const joined = new Date(profile.joinedAt).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] glass-card p-10 shadow-soft">
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-warm-gradient opacity-30 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="size-24 rounded-3xl bg-warm-gradient grid place-items-center text-white text-3xl font-display font-bold shadow-glow">
            {initial}
          </div>
          <div className="flex-1">
            {editing ? (
              <form onSubmit={handleSave} className="space-y-3 max-w-md">
                <div className="flex gap-3">
                  <input
                    className="input"
                    placeholder="First name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                  <input
                    className="input"
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                </div>
                <input
                  className="input"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-warm-gradient text-white px-5 py-2 text-sm font-medium shadow-soft disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded-full glass-panel px-5 py-2 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-bold">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {profile.subscription?.planId?.name ?? "Mathéa student"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.stats.enrolledCourses.map((c) => (
                    <span key={c.id} className="px-3 py-1 rounded-full glass-panel text-xs font-medium">
                      {c.title}
                    </span>
                  ))}
                  {profile.stats.enrolledCourses.length === 0 && (
                    <span className="text-xs text-muted-foreground">No courses started yet</span>
                  )}
                </div>
              </>
            )}
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="rounded-full bg-warm-gradient text-white px-6 py-3 font-medium shadow-soft"
            >
              Edit profile
            </button>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Mail, label: "Email", value: profile.email },
          { icon: Phone, label: "Phone", value: profile.phone || "—" },
          { icon: Calendar, label: "Joined", value: joined },
          { icon: Award, label: "Completed lessons", value: profile.stats.completedLessons },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-5 hover-lift">
            <div className="size-9 rounded-xl bg-warm-gradient grid place-items-center text-white mb-3">
              <s.icon className="size-4" />
            </div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="font-display font-semibold mt-0.5 truncate">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}