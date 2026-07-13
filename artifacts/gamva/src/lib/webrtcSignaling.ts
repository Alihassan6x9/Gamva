import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  addDoc,
  query,
  type Unsubscribe,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

// Firestore is used only as the signaling channel for WebRTC (SDP
// offers/answers + ICE candidates) between the two players in a room.
// Actual audio/video never touches Firestore — it flows peer-to-peer once
// the connection is established.
//
// Layout: gamvaCalls/{roomCode}/pairs/{pairId}
//   - descriptions: { [playerId]: { type, sdp, updatedAt } }
//   - candidates/{autoId}: { from: playerId, candidate: RTCIceCandidateInit, createdAt }

export type SignaledDescription = {
  type: RTCSdpType;
  sdp: string;
};

function pairDocPath(roomCode: string, pairId: string) {
  return `gamvaCalls/${roomCode}/pairs/${pairId}`;
}

export function makePairId(a: string, b: string) {
  return [a, b].sort().join("__");
}

export function sendDescription(
  roomCode: string,
  pairId: string,
  selfId: string,
  description: SignaledDescription
) {
  return setDoc(
    doc(firestore, pairDocPath(roomCode, pairId)),
    {
      descriptions: {
        [selfId]: {
          type: description.type,
          sdp: description.sdp,
          updatedAt: serverTimestamp(),
        },
      },
    },
    { merge: true }
  );
}

export function subscribeToDescription(
  roomCode: string,
  pairId: string,
  remotePeerId: string,
  onDescription: (description: SignaledDescription) => void
): Unsubscribe {
  let lastSdp: string | null = null;
  return onSnapshot(doc(firestore, pairDocPath(roomCode, pairId)), (snap) => {
    const data = snap.data() as { descriptions?: Record<string, SignaledDescription> } | undefined;
    const remote = data?.descriptions?.[remotePeerId];
    if (!remote || remote.sdp === lastSdp) return;
    lastSdp = remote.sdp;
    onDescription({ type: remote.type, sdp: remote.sdp });
  });
}

export function sendCandidate(
  roomCode: string,
  pairId: string,
  selfId: string,
  candidate: RTCIceCandidateInit
) {
  return addDoc(collection(firestore, `${pairDocPath(roomCode, pairId)}/candidates`), {
    from: selfId,
    candidate,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToCandidates(
  roomCode: string,
  pairId: string,
  remotePeerId: string,
  onCandidate: (candidate: RTCIceCandidateInit) => void
): Unsubscribe {
  const q = query(collection(firestore, `${pairDocPath(roomCode, pairId)}/candidates`));
  return onSnapshot(q, (snap) => {
    for (const change of snap.docChanges()) {
      if (change.type !== "added") continue;
      const data = change.doc.data() as { from: string; candidate: RTCIceCandidateInit };
      if (data.from !== remotePeerId) continue;
      onCandidate(data.candidate);
    }
  });
}

// Best-effort teardown of the signaling doc for a pair once a call ends.
// Not load-bearing for correctness (a stale doc is just overwritten the next
// time two players reconnect), so failures here are safe to ignore.
export function cleanupPairSignaling(roomCode: string, pairId: string) {
  return deleteDoc(doc(firestore, pairDocPath(roomCode, pairId))).catch(() => {});
}
