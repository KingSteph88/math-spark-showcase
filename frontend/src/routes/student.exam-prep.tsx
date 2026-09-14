import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ClipboardList, FileCheck2, Trophy, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/student/exam-prep")({
  component: ExamPrep,
});

type ExamPrepItem = {
  key: string;
  title: string;
  description: string;
  resourceCategory: string;
  count: number;
};

const ICONS: Record<string, any> = {
  midterm_review: ClipboardList,
  mock_exams: FileCheck2,
  final_prep: Trophy,
};

const TONES: Record<string, string> = {
  midterm_review: "from-orange-200 to-pink-200",
  mock_exams: "from-rose-200 to-purple-200",
  final_prep: "from-amber-200 to-rose-200",
};

function ExamPrep() {
  const [items, setItems] = useState<ExamPrepItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/student/exam-prep");
        setItems(res.data);
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
        <h1 className="text-4xl font-bold">Exam Preparation</h1>
        <p className="mt-2 text-muted-foreground">Three structured paths to walk into your exams confident.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {(items ?? []).map((it) => {
          const Icon = ICONS[it.key] ?? ClipboardList;
          return (
            <div key={it.key} className="relative overflow-hidden rounded-3xl glass-card p-8 hover-lift">
              <div
                className={`absolute -top-16 -right-16 size-48 rounded-full bg-gradient-to-br ${TONES[it.key]} blur-2xl opacity-70`}
              />
              <div className="relative">
                <div className="size-12 rounded-2xl bg-warm-gradient grid place-items-center text-white shadow-soft">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-5 text-xl font-display font-semibold">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{it.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">{it.count} resources available</p>
                <Link
                  to="/student/resources/$category"
                  params={{ category: it.resourceCategory }}
                  className="mt-6 inline-flex items-center gap-1 text-coral font-medium text-sm hover:gap-2 transition-all"
                >
                  Start preparing <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
