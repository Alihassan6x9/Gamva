import GameCard from "@/components/shared/GameCard";

export default function FamilyPage() {
  return (
    <main className="shell fade-in">
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-4xl mb-4 bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent inline-block">
          Family Games
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Clean, wholesome fun for all ages. Gather the whole family around for game night!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <GameCard 
          title="Kids Truth or Dare" 
          description="Silly dares and fun truths suitable for the younger ones." 
          slug="kids-truth-or-dare" 
          colorClass="from-emerald-400 to-teal-400"
        />
        <GameCard 
          title="Family Would You Rather" 
          description="Hilarious scenarios that will get everyone giggling." 
          slug="family-would-you-rather" 
          colorClass="from-teal-400 to-cyan-400"
        />
        <GameCard 
          title="Family Quiz" 
          description="Test your general knowledge with family-friendly trivia." 
          slug="family-quiz" 
          colorClass="from-cyan-400 to-blue-400"
        />
      </div>
    </main>
  );
}
