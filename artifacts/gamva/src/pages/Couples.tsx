import GameCard from "@/components/shared/GameCard";

export default function CouplesPage() {
  return (
    <main className="shell fade-in">
      <div className="text-center mb-12">
        <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
          Strictly 18+
        </span>
        <h1 className="font-display font-bold text-4xl mb-4 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent inline-block">
          Couples Games
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Spice up your date night with premium games designed specifically for couples and close partners.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <GameCard 
          title="Truth or Dare 18+" 
          description="Turn up the heat. Not for the faint of heart." 
          slug="truth-or-dare-18" 
          is18Plus
          colorClass="from-red-500 to-rose-500"
        />
        <GameCard 
          title="Never Have I Ever 18+" 
          description="Discover your partner's wildest secrets and hidden desires." 
          slug="never-have-i-ever-18" 
          is18Plus
          colorClass="from-rose-400 to-pink-500"
        />
        <GameCard 
          title="What I Prefer 18+" 
          description="Find out exactly what your partner wants behind closed doors." 
          slug="what-i-prefer-18" 
          is18Plus
          colorClass="from-pink-500 to-purple-500"
        />
      </div>
    </main>
  );
}
