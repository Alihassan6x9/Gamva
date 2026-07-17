import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ref, onValue, remove, update } from "firebase/database";

import { db, ensureSignedIn, isFirebaseConfigured, trackPresence } from "@/lib/firebase";

import { pickPrompts } from "@/lib/prompts/thisOrThat";
import { pickTruthOrDare } from "@/lib/prompts/truthOrDare";
import { useRoomCall } from "@/hooks/useRoomCall";
import CommunicationSettings from "@/components/call/CommunicationSettings";
import CallBar from "@/components/call/CallBar";
import CallErrorBoundary from "@/components/call/CallErrorBoundary";
import GameView from "./GameView";
import { Copy, Check, Users } from "lucide-react";

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

          trackPresence(code, storedId);

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

  console.log("ROOM OBJECT:", room);
  console.log("ROOM PLAYERS:", room?.players);
  console.log("PLAYER ENTRIES:", Object.entries(room?.players || {}));
  console.log("PLAYER COUNT:", Object.entries(room?.players || {}).length);

  const players = Object.entries(room?.players || {})
  .filter(([id]) => id)
  .sort(
    (a, b) =>
      (a[1] as any).joinedAt - (b[1] as any).joinedAt
  );

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
      <main className="shell fade-in flex items-center justify-center">
        <div className="card text-center max-w-sm w-full py-12">
          <h2 className="font-display font-bold text-2xl text-slate-800 mb-4">Room closed</h2>
          <p className="text-slate-500 mb-8">
            This room doesn't exist anymore — the host may have closed it or it timed out.
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
      <main className="shell flex flex-col items-center justify-center fade-in">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
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
      <div className="min-h-screen bg-slate-50 pb-32">
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
      </div>
    );
  }

  return (
    <main className="shell-sm w-full fade-in pt-8">
      <CallErrorBoundary>{call.connectionsNode}</CallErrorBoundary>
      
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-900 mb-2">Game Lobby</h1>
        <p className="text-slate-500">Wait for everyone to join before starting.</p>
      </div>

      <div className="ticket mb-6 shadow-sm border-purple-100">
        <div>
          <div className="ticket-label text-purple-600 font-bold">room code</div>
          <div className="ticket-code">{code}</div>
        </div>
        <div className="ticket-divider" />
        <button 
          className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-xl font-bold text-sm transition-colors flex flex-col items-center gap-1 w-[120px]" 
          onClick={copyLink}
        >
          {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      <div className="card mb-6 border-blue-100 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="ticket-label flex items-center gap-1.5 m-0 text-slate-500">
            <Users size={14} /> players ({players.length}/2)
          </div>
        </div>
        
        <div className="space-y-1">
          {players.map(([id, p]) => (
            <div className="player-row bg-slate-50/50 rounded-xl px-4 py-3 border border-slate-100" key={id}>
              <span className="player-dot" />
              <span className="player-name text-slate-700">{p.name}</span>
              {p.isHost && <span className="player-tag">Host</span>}
              {id === playerId && <span className="text-xs font-bold text-slate-400 uppercase ml-2">(You)</span>}
            </div>
          ))}
          {players.length < 2 && (
            <div className="player-row bg-slate-50 border border-dashed border-slate-200 rounded-xl px-4 py-3 justify-center text-slate-400 text-sm font-medium">
              Waiting for player 2...
            </div>
          )}
        </div>
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

      <div className="text-center mt-8">
        <button className="btn-ghost text-red-500 hover:text-red-600 hover:bg-red-50" onClick={leaveRoom}>
          Leave room
        </button>
      </div>
    </main>
  );
}
