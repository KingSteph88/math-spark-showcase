import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Layers,
  Radio,
  FileText,
  ArrowRight,
  Play,
  Calendar,
  Download,
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mathéa — Learn Mathematics the Smart Way" },
      { name: "description", content: "A simple platform helping first-year university students master Algebra and Analysis." },
      { property: "og:title", content: "Mathéa — Learn Mathematics the Smart Way" },
      { property: "og:description", content: "Concise lessons, exercises and live online sessions for first-year students." },
    ],
  }),
  component: Landing,
});

const stats = [
  { value: "2", label: "Subjects", icon: BookOpen },
  { value: "14", label: "Chapters", icon: Layers },
  { value: "Live", label: "Weekly Sessions", icon: Radio },
  { value: "PDF", label: "Resources", icon: FileText },
];

function Landing() {
  return (
    <div className="min-h-screen bg-hero-aura">
      {/* Top nav */}
      <header className="mx-auto max-w-7xl px-6 pt-6">
        <nav className="glass-panel rounded-full px-3 py-2 flex items-center justify-between shadow-soft">
          <Link to="/" className="flex items-center gap-2 pl-3 pr-4">
            <div className="size-9 rounded-xl bg-warm-gradient grid place-items-center text-white">
              <GraduationCap className="size-5" />
            </div>
            <span className="font-display font-semibold text-lg">Mathéa</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <a href="#features" className="px-4 py-2 rounded-full hover:bg-white/60 hover:text-foreground transition">Features</a>
            <a href="#stats" className="px-4 py-2 rounded-full hover:bg-white/60 hover:text-foreground transition">Platform</a>
            <Link to="/teacher" className="px-4 py-2 rounded-full hover:bg-white/60 hover:text-foreground transition">Teacher</Link>
          </div>
          <Link to="/student" className="rounded-full bg-warm-gradient text-white text-sm font-medium px-5 py-2.5 shadow-soft hover:opacity-90 transition">
            Student Portal
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-medium text-foreground/80 mb-8">
          <Sparkles className="size-3.5 text-coral" />
          Built for first-year university students
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
          Learn Mathematics <br />
          the <span className="text-gradient">Smart Way</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          A simple platform helping first-year university students master Algebra and Analysis
          through concise lessons, exercises and live online sessions.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/student/courses"
            className="group inline-flex items-center gap-2 rounded-full bg-warm-gradient text-white px-7 py-3.5 font-medium shadow-glow hover:opacity-95 transition"
          >
            Explore Courses
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition" />
          </Link>
          <Link
            to="/student/schedule"
            className="inline-flex items-center gap-2 rounded-full glass-card px-7 py-3.5 font-medium hover-lift"
          >
            <Radio className="size-4 text-coral" /> Join Live Sessions
          </Link>
        </div>

        {/* floating preview card */}
        <div className="relative mt-20 max-w-5xl mx-auto">
          <div className="absolute -inset-6 bg-warm-gradient opacity-30 blur-3xl rounded-[3rem]" />
          <div className="relative glass-card rounded-[2rem] p-6 md:p-8 shadow-glow">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl p-5 bg-gradient-to-br from-orange-100 to-pink-100">
                <Play className="size-5 text-coral mb-3" />
                <div className="font-display font-semibold">Recorded Lessons</div>
                <p className="text-sm text-muted-foreground mt-1">Watch concise videos any time, anywhere.</p>
              </div>
              <div className="rounded-2xl p-5 bg-gradient-to-br from-rose-100 to-purple-100">
                <Calendar className="size-5 text-coral mb-3" />
                <div className="font-display font-semibold">Live Sessions</div>
                <p className="text-sm text-muted-foreground mt-1">Weekly Q&A on Discord and Google Meet.</p>
              </div>
              <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-100 to-rose-100">
                <Download className="size-5 text-coral mb-3" />
                <div className="font-display font-semibold">PDF Resources</div>
                <p className="text-sm text-muted-foreground mt-1">Summaries, exercise series and corrections.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-3xl p-6 hover-lift">
              <div className="size-10 rounded-xl bg-warm-gradient grid place-items-center text-white mb-4">
                <s.icon className="size-5" />
              </div>
              <div className="text-3xl font-bold font-display">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-4xl font-bold">A premium learning experience</h2>
          <p className="mt-3 text-muted-foreground">Everything a first-year student needs — beautifully organized.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card rounded-3xl p-8 hover-lift">
            <h3 className="text-2xl font-display font-semibold mb-2">For Students</h3>
            <p className="text-muted-foreground mb-6">Structured chapters, recorded lessons, exercises and live sessions — all in one calm space.</p>
            <Link to="/student" className="inline-flex items-center gap-1 text-coral font-medium">
              Open student portal <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="glass-card rounded-3xl p-8 hover-lift">
            <h3 className="text-2xl font-display font-semibold mb-2">For Teachers</h3>
            <p className="text-muted-foreground mb-6">Manage courses, upload resources, schedule live sessions and reach your students effortlessly.</p>
            <Link to="/teacher" className="inline-flex items-center gap-1 text-coral font-medium">
              Open teacher studio <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
