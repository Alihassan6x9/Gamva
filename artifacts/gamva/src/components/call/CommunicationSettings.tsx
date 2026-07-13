import { useState } from "react";
import VideoTile from "./VideoTile";
import CallControls from "./CallControls";
import type { RemoteCallPeer } from "@/hooks/useRoomCall";

type PlayerInfo = { id: string; name: string; micOn?: boolean; cameraOn?: boolean };
type CallDecision = "choosing" | "joined" | "skipped";

export default function CommunicationSettings({
  selfId,
  selfName,
  players,
  localStream,
  micOn,
  cameraOn,
  micBusy,
  cameraBusy,
  mediaError,
  onToggleMic,
  onToggleCamera,
  remotePeers,
  isHost,
  canStart,
  onStartGame,
}: {
  selfId: string;
  selfName: string;
  players: PlayerInfo[];
  localStream: MediaStream | null;
  micOn: boolean;
  cameraOn: boolean;
  micBusy: boolean;
  cameraBusy: boolean;
  mediaError: string | null;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  remotePeers: RemoteCallPeer[];
  isHost: boolean;
  canStart: boolean;
  onStartGame: () => void;
}) {
  const [decision, setDecision] = useState<CallDecision>("choosing");
  const otherPlayers = players.filter((p) => p.id !== selfId);
  const waitingForPlayers = !canStart;

  function handleJoinCall() {
    setDecision("joined");
  }

  function handleSkip() {
    if (micOn) onToggleMic();
    if (cameraOn) onToggleCamera();
    setDecision("skipped");
  }

  const startGameSection = (
    <div style={{ marginTop: 14 }}>
      {isHost ? (
        <button className="btn btn-primary" disabled={waitingForPlayers} onClick={onStartGame}>
          {waitingForPlayers ? "Waiting for more players…" : "Start game"}
        </button>
      ) : (
        <div className="card" style={{ textAlign: "center", color: "var(--ink-dim)" }}>
          {waitingForPlayers
            ? "Waiting for more players to join…"
            : "Waiting for the host to start the game…"}
        </div>
      )}
    </div>
  );

  return (
    <div className="card comm-settings" style={{ marginBottom: 18 }}>
      <div className="ticket-label" style={{ marginBottom: 12 }}>
        communication settings
      </div>

      <div className="comm-settings-grid">
        <VideoTile stream={localStream} name={selfName || "You"} isSelf micOn={micOn} cameraOn={cameraOn} />
        {decision !== "choosing" &&
          otherPlayers.map((player) => {
            const peer = remotePeers.find((p) => p.id === player.id);
            return (
              <VideoTile
                key={player.id}
                stream={peer?.remoteStream ?? null}
                name={player.name}
                micOn={!!player.micOn}
                cameraOn={!!player.cameraOn}
              />
            );
          })}
      </div>

      <div style={{ display: "flex", justifyContent: "center", margin: "16px 0 4px" }}>
        <CallControls
          micOn={micOn}
          cameraOn={cameraOn}
          micBusy={micBusy}
          cameraBusy={cameraBusy}
          onToggleMic={onToggleMic}
          onToggleCamera={onToggleCamera}
        />
      </div>

      {mediaError && (
        <div className="error-text" style={{ textAlign: "center" }}>
          {mediaError}
        </div>
      )}

      {decision === "choosing" && (
        <>
          <p style={{ color: "var(--ink-dim)", fontSize: 13, textAlign: "center", marginTop: 8 }}>
            Turn on your mic and camera above if you'd like to talk and see each other while you
            play — or skip it and play with text only.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={handleJoinCall}>
              Join call
            </button>
            <button className="btn-ghost" onClick={handleSkip}>
              Skip — play without voice/video
            </button>
          </div>
        </>
      )}

      {decision === "joined" && (
        <p style={{ color: "var(--mint)", fontSize: 13, textAlign: "center", marginTop: 8 }}>
          You're in the call.
        </p>
      )}

      {decision === "skipped" && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <p style={{ color: "var(--ink-dim)", fontSize: 13 }}>Playing without voice or video.</p>
          <button className="btn-ghost" onClick={() => setDecision("choosing")}>
            Turn on voice/video
          </button>
        </div>
      )}

      {decision !== "choosing" && startGameSection}
    </div>
  );
}
