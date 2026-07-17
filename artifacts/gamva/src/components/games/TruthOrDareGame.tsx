import { ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { Check } from "lucide-react";

type Prompt = {
  type: "truth" | "dare";
  text: string;
};

type Room = {
  status: string;
  hostId: string;
  players?: Record<string, { name: string }>;
  game?: {
    type: string;
    round: number;
    prompts: Prompt[];
  };
};

export default function TruthOrDareGame({
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
  const prompt = game.prompts[game.round];


  async function nextRound() {

    if (game.round === game.prompts.length - 1) {

      await update(ref(db, `rooms/${code}`), {
        status: "finished"
      });

    } else {

      await update(ref(db, `rooms/${code}/game`), {
        round: game.round + 1
      });

    }

  }


  if (!prompt) return null;


  return (
    <main className="shell-sm pt-8 fade-in">

      <div className="card text-center">

        <div className="text-sm font-bold text-slate-400 uppercase mb-4">
          Round {game.round + 1} / {game.prompts.length}
        </div>


        <div
          className={`mx-auto w-32 py-2 rounded-full font-bold mb-6
          ${
            prompt.type === "truth"
            ? "bg-blue-100 text-blue-600"
            : "bg-red-100 text-red-600"
          }`}
        >
          {prompt.type.toUpperCase()}
        </div>


        <h1 className="font-display text-3xl font-bold text-slate-800 mb-8">
          {prompt.text}
        </h1>


        {isHost && (
          <button
            className="btn btn-primary"
            onClick={nextRound}
          >
            {game.round === game.prompts.length - 1
              ? "Finish Game"
              : "Next"}
          </button>
        )}

        {!isHost && (
          <div className="text-slate-400 font-bold">
            Waiting for host...
          </div>
        )}

      </div>

    </main>
  );
}
