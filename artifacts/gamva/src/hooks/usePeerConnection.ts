import { useEffect, useRef, useState } from "react";
import {
  makePairId,
  sendCandidate,
  sendDescription,
  subscribeToCandidates,
  subscribeToDescription,
  cleanupPairSignaling,
} from "@/lib/webrtcSignaling";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"] }],
};

export type PeerConnectionState = {
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
};

/**
 * Owns a single RTCPeerConnection to one remote player, signaled through
 * Firestore. Implements the "perfect negotiation" pattern (see MDN) so
 * either side can add/remove tracks at any time (mic/camera toggles) without
 * the two peers racing to send offers at the same moment.
 */
export function usePeerConnection(
  roomCode: string | null,
  selfId: string,
  remotePeerId: string,
  localStream: MediaStream | null
): PeerConnectionState {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>("new");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const addedTrackIdsRef = useRef<Set<string>>(new Set());

  // "Polite" peers roll back their own offer on glare instead of ignoring
  // the incoming one. Deriving politeness from a simple ID comparison keeps
  // it consistent for both sides without any extra coordination.
  const polite = selfId > remotePeerId;

  useEffect(() => {
    if (!roomCode) return;

    const pairId = makePairId(selfId, remotePeerId);
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;
    addedTrackIdsRef.current = new Set();

    let makingOffer = false;
    let ignoreOffer = false;

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) sendCandidate(roomCode, pairId, selfId, candidate.toJSON());
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0] ?? null);
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
    };

    pc.onnegotiationneeded = async () => {
      try {
        makingOffer = true;
        await pc.setLocalDescription();
        if (pc.localDescription) {
          await sendDescription(roomCode, pairId, selfId, {
            type: pc.localDescription.type,
            sdp: pc.localDescription.sdp,
          });
        }
      } catch (err) {
        console.error("Negotiation error", err);
      } finally {
        makingOffer = false;
      }
    };

    const unsubDescription = subscribeToDescription(roomCode, pairId, remotePeerId, async (description) => {
      try {
        const offerCollision =
          description.type === "offer" && (makingOffer || pc.signalingState !== "stable");
        ignoreOffer = !polite && offerCollision;
        if (ignoreOffer) return;

        await pc.setRemoteDescription(description);
        if (description.type === "offer") {
          await pc.setLocalDescription();
          if (pc.localDescription) {
            await sendDescription(roomCode, pairId, selfId, {
              type: pc.localDescription.type,
              sdp: pc.localDescription.sdp,
            });
          }
        }
      } catch (err) {
        console.error("Failed to apply remote description", err);
      }
    });

    const unsubCandidates = subscribeToCandidates(roomCode, pairId, remotePeerId, async (candidate) => {
      try {
        await pc.addIceCandidate(candidate);
      } catch (err) {
        if (!ignoreOffer) console.error("Failed to add ICE candidate", err);
      }
    });

    return () => {
      unsubDescription();
      unsubCandidates();
      pc.close();
      pcRef.current = null;
      setRemoteStream(null);
      cleanupPairSignaling(roomCode, pairId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, selfId, remotePeerId]);

  // Keep this connection's outgoing tracks in sync with the local stream —
  // adding a track here fires `onnegotiationneeded` automatically.
  useEffect(() => {
    const pc = pcRef.current;
    if (!pc || !localStream) return;

    for (const track of localStream.getTracks()) {
      if (addedTrackIdsRef.current.has(track.id)) continue;
      pc.addTrack(track, localStream);
      addedTrackIdsRef.current.add(track.id);
    }
  }, [localStream, localStream?.getTracks().length]);

  return { remoteStream, connectionState };
}
