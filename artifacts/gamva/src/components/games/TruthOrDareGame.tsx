import { useState } from "react";
import { ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { Check, Flame, ShieldQuestion } from "lucide-react";

type Prompt = {
  type: "truth" | "dare";
  text: string;
};

type Room = {
  status: string;
  hostId: string;
  players?: Record<string, any>;
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

  const [completed, setCompleted] = useState(false);

  async function nextRound() {
    if (game.round === game.prompts.length - 1) {
      await update(ref(db, `rooms/${code}`), {
        status: "finished",
      });
      return;
    }

    await update(ref(db, `rooms/${code}/game`), {
      round: game.round + 1,
    });

    setCompleted(false);
  }


  return (
    <main className="shell-sm pt-8 fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">

        <div className="flex items-center gap-3">

          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              prompt.type === "truth"
                ? "bg-blue-100 text-blue-600"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            {
              prompt.type === "truth"
                ? <ShieldQuestion size={22}/>
                : <Flame size={22}/>
            }
          </div>


          <div>
            <h1 className="font-display font-bold text-xl text-slate-900">
              Truth or Dare
            </h1>

            <p className="text-sm text-slate-400">
              Round {game.round + 1} of {game.prompts.length}
            </p>
          </div>

        </div>


      </div>



      {/* Card */}
      <div className="card text-center shadow-xl border-purple-100 py-10">

        <div
          className={`inline-flex px-5 py-2 rounded-full text-sm font-bold mb-8 ${
            prompt.type === "truth"
              ? "bg-blue-100 text-blue-600"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          {prompt.type.toUpperCase()}
        </div>


        <h2 className="font-display font-bold text-3xl text-slate-900 leading-tight mb-10">
          {prompt.text}
        </h2>


        {!completed && (

          <button
            onClick={() => setCompleted(true)}
            className="btn btn-primary"
          >
            I Completed It
          </button>

        )}


        {completed && (

          <div className="space-y-5">

            <div className="flex justify-center items-center gap-2 text-emerald-600 font-bold">
              <Check size={20}/>
              Completed
            </div>


            {isHost && (

              <button
                onClick={nextRound}
                className="btn btn-primary"
              >
                {
                  game.round === game.prompts.length - 1
                    ? "Finish Game"
                    : "Next Round"
                }
              </button>

            )}


            {!isHost && (

              <p className="text-slate-400 font-medium">
                Waiting for host...
              </p>

            )}

          </div>

        )}

      </div>


    </main>
  );
}
