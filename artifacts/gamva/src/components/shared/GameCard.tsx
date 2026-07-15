import { Link } from "wouter";
import { PlayCircle, Clock } from "lucide-react";

export type GameCardProps = {
  title: string;
  description: string;
  slug: string;
  isPlayable?: boolean;
  is18Plus?: boolean;
  colorClass?: string;
};

export default function GameCard({ title, description, slug, isPlayable, is18Plus, colorClass = "from-purple-500 to-blue-500" }: GameCardProps) {
  const href = isPlayable ? `/?game=${slug}` : `/coming-soon/${slug}`;

  return (
    <Link href={href} className="block card card-hover relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${colorClass} rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-2xl`}></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="font-display font-bold text-xl text-slate-800 pr-4">{title}</h3>
        {is18Plus && (
          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
            18+
          </span>
        )}
      </div>
      
      <p className="text-slate-500 text-sm mb-6 relative z-10 line-clamp-2">
        {description}
      </p>

      <div className="flex items-center gap-2 relative z-10">
        {isPlayable ? (
          <span className="inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-slate-900 px-4 py-2 rounded-xl shadow-md group-hover:bg-slate-800 transition-colors w-full">
            <PlayCircle size={16} />
            Play Now
          </span>
        ) : (
          <span className="inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl w-full">
            <Clock size={16} />
            Coming Soon
          </span>
        )}
      </div>
    </Link>
  );
}
