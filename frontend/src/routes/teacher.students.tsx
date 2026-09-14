import { createFileRoute } from "@tanstack/react-router";
import { Search, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { teacherApi } from "@/lib/teacherApi";

export const Route = createFileRoute("/teacher/students")({
  component: Students,
});

type Student = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
};

function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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

      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="px-6 py-4 grid grid-cols-[1.2fr_1.2fr_auto] gap-6 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/60">
            <div>Student Name</div><div>Email</div><div>Status</div>
          </div>
          {students.map((s) => (
            <div key={s._id} className="px-6 py-4 grid grid-cols-[1.2fr_1.2fr_auto] gap-6 items-center hover:bg-white/40 transition">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-warm-gradient text-white grid place-items-center font-display font-semibold">
                  {s.firstName[0]}
                </div>
                <span className="font-medium">{s.firstName} {s.lastName}</span>
              </div>
              <span className="text-sm text-muted-foreground truncate">{s.email}</span>
              <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium w-fit">{s.status}</span>
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
