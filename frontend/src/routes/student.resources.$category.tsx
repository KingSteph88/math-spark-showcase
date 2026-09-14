import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/student/resources/$category")({
  component: ResourceCategory,
});

type ResourceItem = {
  id: string;
  title: string;
  category: string;
  course: { id: string; title: string } | null;
  fileUrl: string;
  fileType?: string;
  fileSizeBytes?: number;
  difficulty?: string;
  examYear?: number;
  downloadsCount: number;
};

const TITLES: Record<string, string> = {
  formula_sheet: "Formula Sheets",
  course_summary: "Course Summaries",
  exercise_series: "Exercise Series",
  previous_exam: "Previous Exams",
  correction: "Corrections",
};

function formatSize(bytes?: number) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function ResourceCategory() {
  const { category } = Route.useParams();

  const [items, setItems] = useState<ResourceItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/student/resources/${category}`);
        setItems(res.data);
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [category]);

  async function handleDownload(resource: ResourceItem) {
    try {
      await api.post(`/student/resources/${resource.id}/download`);
    } catch (err) {
      console.error(err);
    } finally {
      window.open(resource.fileUrl, "_blank", "noreferrer");
    }
  }

  return (
    <div className="space-y-8">
      <Link
        to="/student/resources"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to resources
      </Link>

      <div>
        <h1 className="text-4xl font-bold">{TITLES[category] ?? "Resources"}</h1>
        <p className="mt-2 text-muted-foreground">{items?.length ?? 0} files available.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {(items ?? []).map((r) => (
            <div key={r.id} className="glass-card rounded-2xl p-5 flex items-center justify-between gap-4 hover-lift">
              <div className="min-w-0">
                <div className="font-semibold truncate">{r.title}</div>
                <div className="text-sm text-muted-foreground mt-0.5 flex flex-wrap gap-x-3">
                  {r.course && <span>{r.course.title}</span>}
                  {r.examYear && <span>{r.examYear}</span>}
                  {r.difficulty && <span className="capitalize">{r.difficulty}</span>}
                  {formatSize(r.fileSizeBytes) && <span>{formatSize(r.fileSizeBytes)}</span>}
                </div>
              </div>
              <button
                onClick={() => handleDownload(r)}
                className="shrink-0 rounded-full glass-panel px-4 py-2 text-sm font-medium inline-flex items-center gap-2 hover:bg-white transition"
              >
                <Download className="size-4" /> Download
              </button>
            </div>
          ))}
          {items && items.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
              No files here yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
