import GameCard from "@/components/shared/GameCard";

export default function GamesPage() {
  return (
    <main className="shell fade-in">
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-4xl mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent inline-block">
          Party Games
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          The classics you know and love, reimagined for the best multiplayer experience. Grab your friends and jump in.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        <GameCard 
          title="This or That" 
          description="A fast-paced game of difficult choices. See how your answers stack up against your friends." 
          slug="this-or-that" 
          isPlayable 
          colorClass="from-pink-500 to-orange-400"
        />
        <GameCard 
          title="Truth or Dare" 
          description="The ultimate party classic. Spill your secrets or face the consequences." 
          slug="truth-or-dare" 
        />
        <GameCard 
          title="Never Have I Ever" 
          description="Find out what your friends have been up to. Put your fingers down!" 
          slug="never-have-i-ever" 
        />
        <GameCard 
          title="Would You Rather" 
          description="Absurd dilemmas and impossible choices. Pick your poison." 
          slug="would-you-rather" 
        />
        <GameCard 
          title="Most Likely To" 
          description="Call out your friends. Who is most likely to survive a zombie apocalypse?" 
          slug="most-likely-to" 
        />
        <GameCard 
          title="Two Truths & a Lie" 
          description="Can you spot the fake? Test how well you really know each other." 
          slug="two-truths-and-a-lie" 
        />
      </div>

      <div className="text-center py-12 border-t border-slate-200/50">
        <div className="eyebrow mb-4">Stay Tuned</div>
        <h2 className="font-display font-bold text-2xl mb-2 text-slate-800">More games coming soon</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          We're constantly working on new party games. Check back often for fresh updates to the catalog!
        </p>
      </div>
    </main>
  );
}
