import { ref, update } from "firebase/database";
import { db } from "@/lib/firebase";

type Prompt = { a: string; b: string };
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
      <main className="shell">
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          this or that · game over
        </div>
        <div className="card" style={{ textAlign: "center", marginBottom: 16 }}>
          <p style={{ marginTop: 0 }}>
            That's all {game.prompts.length} rounds! Thanks for playing.
          </p>
        </div>
        {isHost ? (
          <button className="btn btn-primary" onClick={playAgain}>
            Back to lobby
          </button>
        ) : (
          <div className="card" style={{ textAlign: "center", color: "var(--ink-dim)" }}>
            Waiting for the host to return to the lobby…
          </div>
        )}
      </main>
    );
  }

  // ---------- Active round ----------
  return (
    <main className="shell">
      <div className="eyebrow" style={{ marginBottom: 10 }}>
        this or that · round {round + 1} of {game.prompts.length}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
        <ChoiceButton
          label={prompt.a}
          selected={myVote === "a"}
          disabled={!!myVote}
          onClick={() => castVote("a")}
          revealed={allVoted}
          count={countA}
          total={playerIds.length}
        />
        <ChoiceButton
          label={prompt.b}
          selected={myVote === "b"}
          disabled={!!myVote}
          onClick={() => castVote("b")}
          revealed={allVoted}
          count={countB}
          total={playerIds.length}
        />
      </div>

      {!allVoted && (
        <div className="card" style={{ textAlign: "center", color: "var(--ink-dim)", marginBottom: 14 }}>
          {myVote ? "Waiting on the rest of the group…" : "Tap the one you'd pick."}
          <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: 12 }}>
            {playerIds.filter((id) => votes[id]).length}/{playerIds.length} answered
          </div>
        </div>
      )}

      {allVoted && isHost && (
        <button className="btn btn-primary" onClick={nextRound}>
          {isLastRound ? "Finish game" : "Next round"}
        </button>
      )}
      {allVoted && !isHost && (
        <div className="card" style={{ textAlign: "center", color: "var(--ink-dim)" }}>
          Waiting for the host to continue…
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
}: {
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  revealed: boolean;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="card"
      style={{
        position: "relative",
        textAlign: "left",
        cursor: disabled ? "default" : "pointer",
        border: selected ? "1px solid var(--hot)" : "1px solid var(--line)",
        overflow: "hidden",
      }}
    >
      {revealed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            background: "rgba(255, 61, 110, 0.14)",
            transition: "width 0.4s ease",
          }}
        />
      )}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
          {label}
        </span>
        {revealed && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-dim)" }}>
            {count}/{total}
          </span>
        )}
      </div>
    </button>
  );
}
