import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ref, onValue, onDisconnect, remove, update } from "firebase/database";
import { db, ensureSignedIn, isFirebaseConfigured } from "@/lib/firebase";
import { pickPrompts } from "@/lib/prompts/thisOrThat";
import { useRoomCall } from "@/hooks/useRoomCall";
import CommunicationSettings from "@/components/call/CommunicationSettings";
import CallBar from "@/components/call/CallBar";
import CallErrorBoundary from "@/components/call/CallErrorBoundary";
import GameView from "./GameView";

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code || "").toUpperCase();
  const [, navigate] = useLocation();
  const [room, setRoom] = useState<any>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setNotFound(true);
      return;
    }

    const storedId = localStorage.getItem(`gamva:${code}:playerId`);
    if (!storedId) {
      navigate(`/?join=${code}`, { replace: true });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const players = room?.players
    ? Object.entries(room.players as Record<string, any>).sort(
        (a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0)
      )
    : [];
  const remotePeerIds = useMemo(
    () => players.map(([id]) => id).filter((id) => id !== playerId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [players.map(([id]) => id).join(","), playerId]
  );

  const call = useRoomCall({ roomCode: code, selfId: playerId || "", remotePeerIds });

  function leaveRoom() {
    call.leaveCall();
    if (playerId) {
      remove(ref(db, `rooms/${code}/players/${playerId}`));
      localStorage.removeItem(`gamva:${code}:playerId`);
    }
    navigate("/");
  }

  // Stop any active media/peer connections if the tab navigates away or
  // closes without an explicit "leave room" click.
  useEffect(() => {
    return () => call.leaveCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function copyLink() {
    const url = `${window.location.origin}/room/${code}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function startGame() {
    const prompts = pickPrompts(8);
    await update(ref(db, `rooms/${code}`), {
      status: "playing",
      game: {
        type: "this-or-that",
        round: 0,
        prompts,
        votes: {},
      },
    });
  }

  if (notFound) {
    return (
      <main className="shell">
        <div className="card">
          <p style={{ marginTop: 0 }}>
            This room doesn't exist anymore — the host may have closed it.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Back home
          </button>
        </div>
      </main>
    );
  }

  if (!room || !playerId) {
    return (
      <main className="shell">
        <div className="eyebrow">loading room…</div>
      </main>
    );
  }

  const isHost = room.hostId === playerId;
  const selfName = room.players?.[playerId]?.name ?? "";
  const playerInfos = players.map(([id, p]) => ({
    id,
    name: p.name,
    micOn: !!p.micOn,
    cameraOn: !!p.cameraOn,
  }));

  if (room.status === "playing" || room.status === "finished") {
    return (
      <>
        <CallErrorBoundary>
          {call.connectionsNode}
        </CallErrorBoundary>
        <GameView code={code} room={room} playerId={playerId} isHost={isHost} />
        <CallErrorBoundary>
          <CallBar
            selfId={playerId}
            selfName={selfName}
            players={playerInfos}
            localStream={call.localStream}
            micOn={call.micOn}
            cameraOn={call.cameraOn}
            onToggleMic={call.toggleMic}
            onToggleCamera={call.toggleCamera}
            onLeaveCall={call.leaveCall}
            remotePeers={call.remotePeers}
          />
        </CallErrorBoundary>
      </>
    );
  }

  return (
    <main className="shell">
      <CallErrorBoundary>{call.connectionsNode}</CallErrorBoundary>
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

      <CallErrorBoundary>
        <CommunicationSettings
          selfId={playerId}
          selfName={selfName}
          players={playerInfos}
          localStream={call.localStream}
          micOn={call.micOn}
          cameraOn={call.cameraOn}
          micBusy={call.micBusy}
          cameraBusy={call.cameraBusy}
          mediaError={call.mediaError}
          onToggleMic={call.toggleMic}
          onToggleCamera={call.toggleCamera}
          remotePeers={call.remotePeers}
          isHost={isHost}
          canStart={players.length >= 2}
          onStartGame={startGame}
        />
      </CallErrorBoundary>

      <button className="btn-ghost" onClick={leaveRoom}>
        Leave room
      </button>
    </main>
  );
}
