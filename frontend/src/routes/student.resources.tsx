import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Calculator,
  FileText,
  ListChecks,
  GraduationCap,
  CheckCircle2,
  Download,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/student/resources")({
  component: Resources,
});

type Category =
  | "formula_sheet"
  | "course_summary"
  | "exercise_series"
  | "previous_exam"
  | "correction";

type CategorySummary = { category: Category; count: number };

const CATEGORY_META: Record<Category, { icon: any; title: string; desc: string; color: string }> = {
  formula_sheet: {
    icon: Calculator,
    title: "Formula Sheets",
    desc: "All essential formulas in one place.",
    color: "from-orange-200 to-pink-200",
  },
  course_summary: {
    icon: FileText,
    title: "Course Summaries",
    desc: "Condensed chapter overviews.",
    color: "from-rose-200 to-purple-200",
  },
  exercise_series: {
    icon: ListChecks,
    title: "Exercise Series",
    desc: "Targeted practice sets.",
    color: "from-amber-200 to-rose-200",
  },
  previous_exam: {
    icon: GraduationCap,
    title: "Previous Exams",
    desc: "Past papers from prior years.",
    color: "from-fuchsia-200 to-orange-200",
  },
  correction: {
    icon: CheckCircle2,
    title: "Corrections",
    desc: "Step-by-step solutions.",
    color: "from-pink-200 to-purple-200",
  },
};

function Resources() {
  const [categories, setCategories] = useState<CategorySummary[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/student/resources");
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Resources</h1>
        <p className="mt-2 text-muted-foreground">
          Everything you need — formula sheets, summaries, exercises and exams.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(categories ?? []).map((c) => {
          const meta = CATEGORY_META[c.category];
          const Icon = meta.icon;
          return (
            <div key={c.category} className="glass-card rounded-3xl p-6 hover-lift">
              <div className={`size-12 rounded-2xl bg-gradient-to-br ${meta.color} grid place-items-center mb-5 shadow-soft`}>
                <Icon className="size-6 text-foreground/80" />
              </div>
              <div className="flex items-baseline justify-between">
                <h3 className="font-display font-semibold text-lg">{meta.title}</h3>
                <span className="text-xs text-muted-foreground">{c.count} files</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{meta.desc}</p>
              <Link
                to="/student/resources/$category"
                params={{ category: c.category }}
                className="mt-5 w-full rounded-full glass-panel py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-white transition"
              >
                <Download className="size-4" /> Browse files
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}