import { useLocation } from "wouter";

export default function TruthOrDarePage() {

  const [, navigate] = useLocation();

  function createGame() {
    navigate("/?game=truth-or-dare-18");
  }

  return (
    <main className="shell-sm pt-12 text-center">

      <div className="card">

        <h1 className="font-display text-3xl font-bold">
          Truth or Dare 18+
        </h1>

        <p className="text-slate-500 mt-3">
          Create a private room and challenge your friend.
        </p>

        <button
          className="btn btn-primary mt-6"
          onClick={createGame}
        >
          Create Room
        </button>

      </div>

    </main>
  );
}
