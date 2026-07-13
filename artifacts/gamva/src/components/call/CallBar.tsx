import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import VideoTile from "./VideoTile";
import CallControls from "./CallControls";
import type { RemoteCallPeer } from "@/hooks/useRoomCall";

type PlayerInfo = { id: string; name: string; micOn?: boolean; cameraOn?: boolean };

/** Compact, collapsible call widget shown during an active game round. */
export default function CallBar({
  selfId,
  selfName,
  players,
  localStream,
  micOn,
  cameraOn,
  onToggleMic,
  onToggleCamera,
  onLeaveCall,
  remotePeers,
}: {
  selfId: string;
  selfName: string;
  players: PlayerInfo[];
  localStream: MediaStream | null;
  micOn: boolean;
  cameraOn: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onLeaveCall: () => void;
  remotePeers: RemoteCallPeer[];
}) {
  const [expanded, setExpanded] = useState(true);
  const otherPlayers = players.filter((p) => p.id !== selfId);
  const inCall = micOn || cameraOn;

  return (
    <div className="call-bar">
      <button
        type="button"
        className="call-bar-toggle"
        onClick={() => setExpanded((e) => !e)}
        aria-label={expanded ? "Collapse call" : "Expand call"}
      >
        <span>{inCall ? "In call" : "Call"}</span>
        {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {expanded && (
        <>
          <div className="call-bar-tiles">
            <VideoTile stream={localStream} name={selfName || "You"} isSelf micOn={micOn} cameraOn={cameraOn} compact />
            {otherPlayers.map((player) => {
              const peer = remotePeers.find((p) => p.id === player.id);
              return (
                <VideoTile
                  key={player.id}
                  stream={peer?.remoteStream ?? null}
                  name={player.name}
                  micOn={!!player.micOn}
                  cameraOn={!!player.cameraOn}
                  compact
                />
              );
            })}
          </div>
          <CallControls
            micOn={micOn}
            cameraOn={cameraOn}
            onToggleMic={onToggleMic}
            onToggleCamera={onToggleCamera}
            onLeaveCall={inCall ? onLeaveCall : undefined}
            compact
          />
        </>
      )}
    </div>
  );
}
