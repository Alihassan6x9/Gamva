"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, onValue, onDisconnect, remove } from "firebase/database";
import { db, ensureSignedIn } from "@/lib/firebase";

export default function RoomClient({ code }) {
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem(`gamva:${code}:playerId`);
    if (!storedId) {
      router.replace(`/?join=${code}`);
      return;
    }
    setPlayerId(storedId);

    let unsubscribe = () => {};

    (async () => {
      await ensureSignedIn();
      const roomRef = ref(db, `rooms/${code}`);

      // If this player's connection drops (tab closed, phone locked and
      // network lost, etc), remove them from the live list automatically.
      onDisconnect(ref(db, `rooms/${code}/players/${storedId}`)).remove();

      unsubscribe = onValue(roomRef, (snap) => {
        if (!snap.exists()) {
          setNotFound(true);
          return;
        }
        setRoom(snap.val());
      });
    })();

    return () => unsubscribe();
  }, [code, router]);

  function leaveRoom() {
    if (playerId) {
      remove(ref(db, `rooms/${code}/players/${playerId}`));
      localStorage.removeItem(`gamva:${code}:playerId`);
    }
    router.push("/");
  }

  function copyLink() {
    const url = `${window.location.origin}/room/${code}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  if (notFound) {
    return (
      <main className="shell">
        <div className="card">
          <p style={{ marginTop: 0 }}>
            This room doesn't exist anymore — the host may have closed it.
          </p>
          <button className="btn btn-primary" onClick={() => router.push("/")}>
            Back home
          </button>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="shell">
        <div className="eyebrow">loading room…</div>
      </main>
    );
  }

  const players = room.players
    ? Object.entries(room.players).sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0))
    : [];
  const isHost = room.hostId === playerId;

  return (
    <main className="shell">
      <div style={{ marginBottom: 22 }}>
        <span className="wordmark" style={{ fontSize: 22 }}>
          GAM<span className="dot">V</span>A
        </span>
      </div>

      <div className="ticket" style={{ marginBottom: 10 }}>
        <div>
          <div className="ticket-label">room code</div>
          <div className="ticket-code">{code}</div>
        </div>
        <div className="ticket-divider" />
        <button className="btn-ghost" onClick={copyLink}>
          {copied ? "Link copied ✓" : "Copy invite link"}
        </button>
      </div>

      <p style={{ color: "var(--ink-dim)", fontSize: 14, marginTop: 4, marginBottom: 22 }}>
        Share this code — friends tap "Join room" on GAMVA and type it in.
      </p>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="ticket-label" style={{ marginBottom: 10 }}>
          players ({players.length})
        </div>
        {players.map(([id, p]) => (
          <div className="player-row" key={id}>
            <span className="player-dot" />
            <span className="player-name">{p.name}</span>
            {p.isHost && <span className="player-tag">Host</span>}
          </div>
        ))}
      </div>

      {isHost ? (
        <button className="btn btn-primary" disabled={players.length < 2} style={{ marginBottom: 12 }}>
          {players.length < 2 ? "Waiting for more players…" : "Start game (coming next)"}
        </button>
      ) : (
        <div className="card" style={{ textAlign: "center", color: "var(--ink-dim)", marginBottom: 12 }}>
          Waiting for the host to start the game…
        </div>
      )}

      <button className="btn-ghost" onClick={leaveRoom}>
        Leave room
      </button>
    </main>
  );
}
