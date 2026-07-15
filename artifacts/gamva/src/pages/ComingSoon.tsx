import { useParams, Link } from "wouter";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function ComingSoonPage() {
  const params = useParams<{ gameSlug: string }>();
  const rawSlug = params.gameSlug || "game";
  const gameName = rawSlug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <main className="shell flex items-center justify-center fade-in">
      <div className="card max-w-md w-full text-center py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Sparkles size={32} />
          </div>
          
          <h1 className="font-display font-bold text-3xl mb-2 text-slate-900">{gameName}</h1>
          <div className="eyebrow text-purple-500 mb-6">Coming Soon</div>
          
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">
            Our team is working hard to bring this game to the platform. It will be available in a future update!
          </p>

          <Link href="/games" className="btn btn-secondary inline-flex justify-center w-auto">
            <ArrowLeft size={16} />
            Back to games
          </Link>
        </div>
      </div>
    </main>
  );
}
