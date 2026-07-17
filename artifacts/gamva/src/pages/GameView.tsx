import { ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { Check } from "lucide-react";
import TruthOrDareGame from "@/components/games/TruthOrDareGame";


type Prompt =
  | { a: string; b: string } // This or That
  | { type: "truth" | "dare"; text: string }; // Truth or Dare
type Room = {
  status: string;
  hostId: string;
  players?: Record<string, { name: string; isHost?: boolean; joinedAt?: number }>;
  game?: {
  type: string;
  round: number;
  prompts: Prompt[];
  votes?: Record<number, Record<string, "a" | "b">>;
};
};

export default function GameView({
  code,
  room,
  playerId,
  isHost,
}: {
  code: string;
  room: Room;
  playerId: string;
  isHost: boolean;
}) {
    const game = room.game!;

  // ---------- Truth or Dare ----------
  if (game.type === "truth-or-dare") {
    return (
      <TruthOrDareGame
        code={code}
        room={room}
        playerId={playerId}
        isHost={isHost}
      />
    );
  }

  const players = room.players || {};
  const playerIds = Object.keys(players);
  const round = game.round;
  const prompt = game.prompts[round];
  const votes = (game.votes && game.votes[round]) || {};
  const myVote = votes[playerId];
  const allVoted = playerIds.length > 0 && playerIds.every((id) => votes[id]);
  const isLastRound = round === game.prompts.length - 1;

  async function castVote(choice: "a" | "b") {
    if (myVote) return; // one vote per round
    await update(ref(db, `rooms/${code}/game/votes/${round}`), {
      [playerId]: choice,
    });
  }

  async function nextRound() {
    if (isLastRound) {
      await update(ref(db, `rooms/${code}`), { status: "finished" });
    } else {
      await update(ref(db, `rooms/${code}/game`), { round: round + 1 });
    }
  }

  async function playAgain() {
    await update(ref(db, `rooms/${code}`), { status: "lobby", game: null });
  }

  const countA = playerIds.filter((id) => votes[id] === "a").length;
  const countB = playerIds.filter((id) => votes[id] === "b").length;

  // ---------- Finished screen ----------
  if (room.status === "finished") {
    return (
      <main className="shell-sm pt-12 fade-in">
        <div className="card text-center mb-8 border-purple-200 shadow-xl shadow-purple-100/50 py-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400 opacity-10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-200">
              <Check size={32} strokeWidth={3} />
            </div>
            <h2 className="font-display font-bold text-3xl text-slate-900 mb-2">Game Over!</h2>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
              That's all {game.prompts.length} rounds completed. Great choices!
            </p>

            {isHost ? (
              <button className="btn btn-primary" onClick={playAgain}>
                Play Again
              </button>
            ) : (
              <div className="bg-slate-50 text-slate-500 font-medium py-3 px-6 rounded-xl border border-slate-100 inline-block">
                Waiting for host to restart...
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ---------- Active round ----------
  return (
    <main className="shell-sm pt-8 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm">
            {round + 1}
          </div>
          <span className="font-display font-bold text-lg text-slate-700">This or That</span>
        </div>
        <div className="text-sm font-bold text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
          Round {round + 1} of {game.prompts.length}
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <ChoiceButton
          label={prompt.a}
          selected={myVote === "a"}
          disabled={!!myVote}
          onClick={() => castVote("a")}
          revealed={allVoted}
          count={countA}
          total={playerIds.length}
          colorTheme="pink"
        />
        
        <div className="flex items-center justify-center my-1 relative">
          <div className="absolute w-full h-px bg-slate-200"></div>
          <span className="relative bg-slate-50 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">OR</span>
        </div>

        <ChoiceButton
          label={prompt.b}
          selected={myVote === "b"}
          disabled={!!myVote}
          onClick={() => castVote("b")}
          revealed={allVoted}
          count={countB}
          total={playerIds.length}
          colorTheme="blue"
        />
      </div>

      {!allVoted && (
        <div className="text-center bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-6">
          <div className="font-medium text-slate-600">
            {myVote ? "Waiting on others..." : "Make your choice!"}
          </div>
          <div className="mt-2 flex justify-center gap-1">
            {playerIds.map(id => (
              <div key={id} className={`w-2 h-2 rounded-full ${votes[id] ? "bg-emerald-400" : "bg-slate-200"}`}></div>
            ))}
          </div>
        </div>
      )}

      {allVoted && isHost && (
        <div className="slide-up text-center mt-8">
          <button className="btn btn-primary shadow-xl shadow-purple-200" onClick={nextRound}>
            {isLastRound ? "View Results" : "Next Round"}
          </button>
        </div>
      )}
      {allVoted && !isHost && (
        <div className="slide-up text-center bg-purple-50 text-purple-600 font-bold py-4 rounded-xl border border-purple-100 mt-8">
          Waiting for host...
        </div>
      )}
    </main>
  );
}

function ChoiceButton({
  label,
  selected,
  disabled,
  onClick,
  revealed,
  count,
  total,
  colorTheme
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  revealed: boolean;
  count: number;
  total: number;
  colorTheme: "pink" | "blue"
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  
  const themeClasses = {
    pink: {
      selected: "border-pink-500 ring-4 ring-pink-100 bg-white",
      bar: "bg-pink-100",
      text: "text-pink-600",
      default: "border-white hover:border-pink-200 hover:bg-pink-50/30"
    },
    blue: {
      selected: "border-blue-500 ring-4 ring-blue-100 bg-white",
      bar: "bg-blue-100",
      text: "text-blue-600",
      default: "border-white hover:border-blue-200 hover:bg-blue-50/30"
    }
  };

  const currentTheme = themeClasses[colorTheme];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full text-left rounded-2xl overflow-hidden transition-all duration-300 bg-white shadow-md
        ${selected ? currentTheme.selected : currentTheme.default}
        ${disabled && !selected ? "opacity-60" : ""}
      `}
      style={{
        borderWidth: selected ? 2 : 2,
        cursor: disabled ? "default" : "pointer"
      }}
    >
      {revealed && (
        <div
          className={`absolute top-0 bottom-0 left-0 transition-all duration-700 ease-out ${currentTheme.bar}`}
          style={{ width: `${pct}%` }}
        />
      )}
      
      <div className="relative z-10 p-6 md:p-8 flex justify-between items-center gap-4">
        <span className={`font-display font-bold text-2xl md:text-3xl leading-tight ${selected ? currentTheme.text : "text-slate-800"}`}>
          {label}
        </span>
        
        {revealed && (
          <div className="flex flex-col items-end shrink-0">
            <span className={`font-display font-bold text-3xl ${currentTheme.text}`}>{pct}%</span>
            <span className="text-xs font-bold text-slate-400 uppercase">{count} {count === 1 ? "vote" : "votes"}</span>
          </div>
        )}
      </div>
    </button>
  );
}
