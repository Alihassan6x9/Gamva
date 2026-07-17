import { ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { Check } from "lucide-react";

type Room = {
  status: string;
  hostId: string;
  players?: Record<
    string,
    {
      name: string;
      isHost?: boolean;
      joinedAt?: number;
    }
  >;
  game?: {
    type: string;
    round: number;
    prompts: {
      type: "truth" | "dare";
      text: string;
    }[];
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

  const round = game.round;
  const prompt = game.prompts[round];

  async function nextRound() {
    if (round === game.prompts.length - 1) {
      await update(ref(db, `rooms/${code}`), {
        status: "finished",
      });
    } else {
      await update(ref(db, `rooms/${code}/game`), {
        round: round + 1,
      });
    }
  }


  async function playAgain() {
    await update(ref(db, `rooms/${code}`), {
      status: "lobby",
      game: null,
    });
  }


  if (room.status === "finished") {
    return (
      <main className="shell-sm pt-12 fade-in">
        <div className="card text-center py-12">

          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-6">
            <Check size={32}/>
          </div>

          <h2 className="font-display font-bold text-3xl mb-3">
            Game Over!
          </h2>

          <p className="text-slate-500 mb-8">
            You completed all Truth or Dare rounds.
          </p>


          {isHost ? (
            <button
              className="btn btn-primary"
              onClick={playAgain}
            >
              Play Again
            </button>
          ) : (
            <p>
              Waiting for host...
            </p>
          )}

        </div>
      </main>
    );
  }


  return (
    <main className="shell-sm pt-8 fade-in">

      <div className="flex justify-between items-center mb-8">

        <h1 className="font-display font-bold text-2xl">
          Truth or Dare
        </h1>


        <div className="bg-white px-4 py-2 rounded-xl shadow">
          Round {round + 1}/{game.prompts.length}
        </div>

      </div>


      <div className="card text-center py-12">


        <div
          className={`inline-block px-5 py-2 rounded-full mb-6 font-bold uppercase
          ${
            prompt.type === "truth"
              ? "bg-blue-100 text-blue-600"
              : "bg-pink-100 text-pink-600"
          }
          `}
        >
          {prompt.type}
        </div>


        <h2 className="font-display font-bold text-3xl text-slate-800 mb-10">
          {prompt.text}
        </h2>



        {isHost ? (
          <button
            className="btn btn-primary"
            onClick={nextRound}
          >
            Next
          </button>
        ) : (
          <p className="text-slate-500">
            Waiting for host...
          </p>
        )}

      </div>


    </main>
  );
}
