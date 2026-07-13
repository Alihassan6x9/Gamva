import VideoTile from "./VideoTile";
import CallControls from "./CallControls";
import type { RemoteCallPeer } from "@/hooks/useRoomCall";

type PlayerInfo = { id: string; name: string; micOn?: boolean; cameraOn?: boolean };

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
  const otherPlayers = players.filter((p) => p.id !== selfId);
  const waitingForPlayers = !canStart;

  return (
    <div className="card comm-settings" style={{ marginBottom: 18 }}>
      <div className="ticket-label" style={{ marginBottom: 12 }}>
        communication settings
      </div>

      <div className="comm-settings-grid">
        <VideoTile stream={localStream} name={selfName || "You"} isSelf micOn={micOn} cameraOn={cameraOn} />
        {otherPlayers.map((player) => {
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

      <p style={{ color: "var(--ink-dim)", fontSize: 13, textAlign: "center", marginTop: 8 }}>
        Voice and video are optional — leave both off and the game plays exactly the same.
      </p>

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
    </div>
  );
}
