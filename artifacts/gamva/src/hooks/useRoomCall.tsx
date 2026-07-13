import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ref, update } from "firebase/database";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { useLocalMedia } from "./useLocalMedia";
import { usePeerConnection, type PeerConnectionState } from "./usePeerConnection";

export type RemoteCallPeer = PeerConnectionState & { id: string };

export type RoomCallState = {
  localStream: MediaStream | null;
  micOn: boolean;
  cameraOn: boolean;
  micBusy: boolean;
  cameraBusy: boolean;
  mediaError: string | null;
  toggleMic: () => void;
  toggleCamera: () => void;
  remotePeers: RemoteCallPeer[];
  leaveCall: () => void;
  /** Must be rendered somewhere in the tree — it hosts the (invisible) peer connections. */
  connectionsNode: ReactNode;
};

function PeerHost({
  roomCode,
  selfId,
  remotePeerId,
  localStream,
  onUpdate,
}: {
  roomCode: string;
  selfId: string;
  remotePeerId: string;
  localStream: MediaStream | null;
  onUpdate: (id: string, state: PeerConnectionState) => void;
}) {
  const state = usePeerConnection(roomCode, selfId, remotePeerId, localStream);

  useEffect(() => {
    onUpdate(remotePeerId, state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remotePeerId, state.remoteStream, state.connectionState]);

  return null;
}

/**
 * Orchestrates the whole optional voice/video call for a room: local
 * mic/camera capture plus a full mesh of peer connections to every other
 * current player, signaled through Firestore. Nothing here is required for
 * the game itself — if a player never toggles mic/camera on, no media
 * devices are touched and no call is joined.
 */
export function useRoomCall({
  roomCode,
  selfId,
  remotePeerIds,
}: {
  roomCode: string;
  selfId: string;
  remotePeerIds: string[];
}): RoomCallState {
  const [remoteStates, setRemoteStates] = useState<Record<string, PeerConnectionState>>({});
  const media = useLocalMedia();

  const handleUpdate = useCallback((id: string, state: PeerConnectionState) => {
    setRemoteStates((prev) => ({ ...prev, [id]: state }));
  }, []);

  // Publish mic/camera status onto the player's existing Realtime Database
  // record so teammates can see call state without inspecting raw WebRTC.
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    update(ref(db, `rooms/${roomCode}/players/${selfId}`), {
      micOn: media.micOn,
      cameraOn: media.cameraOn,
    }).catch(() => {});
  }, [roomCode, selfId, media.micOn, media.cameraOn]);

  // Drop call state for players who've left the room.
  const remoteKey = remotePeerIds.join(",");
  useEffect(() => {
    setRemoteStates((prev) => {
      const next: Record<string, PeerConnectionState> = {};
      for (const id of remotePeerIds) {
        if (prev[id]) next[id] = prev[id];
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteKey]);

  const leaveCall = useCallback(() => {
    media.stopAll();
  }, [media]);

  const connectionsNode = isFirebaseConfigured
    ? remotePeerIds.map((id) => (
        <PeerHost
          key={id}
          roomCode={roomCode}
          selfId={selfId}
          remotePeerId={id}
          localStream={media.stream}
          onUpdate={handleUpdate}
        />
      ))
    : null;

  const remotePeers: RemoteCallPeer[] = remotePeerIds.map((id) => ({
    id,
    ...(remoteStates[id] ?? { remoteStream: null, connectionState: "new" as RTCPeerConnectionState }),
  }));

  return {
    localStream: media.stream,
    micOn: media.micOn,
    cameraOn: media.cameraOn,
    micBusy: media.micBusy,
    cameraBusy: media.cameraBusy,
    mediaError: media.error,
    toggleMic: media.toggleMic,
    toggleCamera: media.toggleCamera,
    remotePeers,
    leaveCall,
    connectionsNode,
  };
}
