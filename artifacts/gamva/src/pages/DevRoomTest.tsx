import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ref, set, serverTimestamp } from "firebase/database";
import { db, ensureSignedIn } from "@/lib/firebase";
import { generatePlayerId } from "@/lib/roomCode";

// Temporary dev-only harness: creates a real room exactly like Home.tsx's
// "Create room" flow (same browser auth session, so RTDB per-uid rules are
// satisfied), then redirects into the real Room page. Not linked from
// anywhere in the app; safe to delete after verifying the lobby UI.
export default function DevRoomTest() {
  const params = useParams<{ code: string }>();
  const [, navigate] = useLocation();
  const [status, setStatus] = useState("setting up test room…");

  useEffect(() => {
    (async () => {
      try {
        const user = await ensureSignedIn();
        const playerId = generatePlayerId();
        const code = params.code || "TEST";

        await set(ref(db, `rooms/${code}`), {
          createdAt: serverTimestamp(),
          status: "lobby",
          hostId: playerId,
          players: {
            [playerId]: {
              name: "Priya",
              age: 24,
              isHost: true,
              joinedAt: serverTimestamp(),
              uid: user.uid,
            },
          },
        });

        localStorage.setItem(`gamva:${code}:playerId`, playerId);
        sessionStorage.setItem("gamva:splashSeen", "1");
        navigate(`/room/${code}`, { replace: true });
      } catch (err) {
        setStatus("Failed to set up test room: " + (err instanceof Error ? err.message : String(err)));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="shell">
      <div className="eyebrow">{status}</div>
    </main>
  );
}
