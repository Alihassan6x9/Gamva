import { Link } from "wouter";
import { ArrowRight, Gamepad2, Lock } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  slug: string;
  colorClass?: string;
  isPlayable?: boolean;
}

export default function GameCard({
  title,
  description,
  slug,
  colorClass = "from-purple-500 to-pink-500",
  isPlayable = false,
}: GameCardProps) {
  return (
    <div className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div
        className={`h-40 bg-gradient-to-br ${colorClass} flex items-center justify-center`}
      >
        <Gamepad2
          size={56}
          className="text-white transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div className="p-6">
        <h3 className="font-display font-bold text-xl text-slate-900 mb-2">
          {title}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          {description}
        </p>

        {isPlayable ? (
          <Link
            href={`/?game=${slug}`}
            className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700"
          >
            Play Now
            <ArrowRight size={16} />
          </Link>
        ) : (
          <div className="inline-flex items-center gap-2 text-slate-400 font-medium">
            <Lock size={16} />
            Coming Soon
          </div>
        )}
      </div>
    </div>
  );
}
