import Link from "next/link";
import { BookOpen, Zap, Brain, Trophy } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Import tout",
    description: "PDF, texte, URL, YouTube — l'IA génère tes flashcards en secondes.",
  },
  {
    icon: Brain,
    title: "Répétition espacée",
    description: "L'algorithme SM-2 planifie tes révisions au bon moment, pas au hasard.",
  },
  {
    icon: Zap,
    title: "Adaptatif",
    description: "Plus tu te trompes sur un concept, plus il revient. Simple.",
  },
  {
    icon: Trophy,
    title: "Ludique",
    description: "Streaks, badges, niveaux — apprendre devient une habitude plaisante.",
  },
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">SelmenLearn</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Connexion
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-brand-500 hover:bg-brand-600 transition-colors px-4 py-2 rounded-lg font-medium"
          >
            Commencer gratuitement
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1.5 mb-8">
          <Zap className="w-4 h-4 text-brand-400" />
          <span className="text-sm text-brand-300">Propulsé par Claude AI</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Tu fournis le contenu.{" "}
          <span className="text-brand-400">On s&apos;occupe du reste.</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Transforme n&apos;importe quel cours, article ou PDF en flashcards et quiz interactifs.
          Mémorise durablement grâce à la science cognitive.
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 transition-all
                     px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-brand-500/25
                     hover:shadow-brand-500/40 hover:-translate-y-0.5"
        >
          Essayer gratuitement
          <Zap className="w-5 h-5" />
        </Link>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6
                         hover:bg-white/8 hover:border-brand-500/30 transition-all"
            >
              <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
