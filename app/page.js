"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ref, set, get, serverTimestamp } from "firebase/database";
import { db, ensureSignedIn } from "@/lib/firebase";
import { generateRoomCode, normalizeRoomCode, generatePlayerId } from "@/lib/roomCode";

const AGE_MIN = 13;
const CREATOR_NAME = "ALBISS DEVELOPER (PAK)";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeForm />
    </Suspense>
  );
}

function HomeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // "splash" -> "landing" -> "create" | "join" | "solo-soon"
  const [screen, setScreen] = useState("splash");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Show the splash once per browser tab, then go straight to landing
  // if the visitor comes back to "/" again later (e.g. after leaving a room).
  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("gamva:splashSeen");
    const joinParam = searchParams.get("join");

    if (alreadySeen) {
      setScreen(joinParam ? "join" : "landing");
    } else {
      const timer = setTimeout(() => {
        sessionStorage.setItem("gamva:splashSeen", "1");
        setScreen(joinParam ? "join" : "landing");
      }, 3200);
      return () => clearTimeout(timer);
    }

    if (joinParam) setJoinCode(joinParam.toUpperCase());

    const savedName = localStorage.getItem("gamva:name");
    const savedAge = localStorage.getItem("gamva:age");
    if (savedName) setName(savedName);
    if (savedAge) setAge(savedAge);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validatePlayer() {
    if (!name.trim()) return "Enter a name so other players know it's you.";
    const ageNum = Number(age);
    if (!age || Number.isNaN(ageNum) || ageNum < AGE_MIN || ageNum > 120) {
      return `Enter an age (${AGE_MIN}+) — some games adjust their prompts by age.`;
    }
    return "";
  }

  async function handleCreate() {
    const validationError = validatePlayer();
    if (validationError) return setError(validationError);
    setError("");
    setLoading(true);
    try {
      const user = await ensureSignedIn();
      const playerId = generatePlayerId();
      let code = generateRoomCode();

      for (let attempt = 0; attempt < 5; attempt++) {
        const snap = await get(ref(db, `rooms/${code}`));
        if (!snap.exists()) break;
        code = generateRoomCode();
      }

      await set(ref(db, `rooms/${code}`), {
        createdAt: serverTimestamp(),
        status: "lobby",
        hostId: playerId,
        players: {
          [playerId]: {
            name: name.trim(),
            age: Number(age),
            isHost: true,
            joinedAt: serverTimestamp(),
            uid: user.uid,
          },
        },
      });

      localStorage.setItem(`gamva:${code}:playerId`, playerId);
      localStorage.setItem("gamva:name", name.trim());
      localStorage.setItem("gamva:age", age);
      router.push(`/room/${code}`);
    } catch (err) {
      console.error(err);
      setError("Couldn't create the room. Check your connection and try again.");
      setLoading(false);
    }
  }

  async function handleJoin() {
    const validationError = validatePlayer();
    if (validationError) return setError(validationError);
    const code = normalizeRoomCode(joinCode);
    if (code.length < 4) return setError("Enter the 4-character room code.");
    setError("");
    setLoading(true);
    try {
      const user = await ensureSignedIn();
      const roomRef = ref(db, `rooms/${code}`);
      const snap = await get(roomRef);
      if (!snap.exists()) {
        setError("No room found with that code. Double check with the host.");
        setLoading(false);
        return;
      }
      const room = snap.val();
      if (room.status && room.status !== "lobby") {
        setError("That room already started its game. Ask the host for a new code.");
        setLoading(false);
        return;
      }

      const playerId = generatePlayerId();
      await set(ref(db, `rooms/${code}/players/${playerId}`), {
        name: name.trim(),
        age: Number(age),
        isHost: false,
        joinedAt: serverTimestamp(),
        uid: user.uid,
      });

      localStorage.setItem(`gamva:${code}:playerId`, playerId);
      localStorage.setItem("gamva:name", name.trim());
      localStorage.setItem("gamva:age", age);
      router.push(`/room/${code}`);
    } catch (err) {
      console.error(err);
      setError("Couldn't join the room. Check your connection and try again.");
      setLoading(false);
    }
  }

  // ---------- Splash ----------
  if (screen === "splash") {
    return (
      <main className="shell splash-screen">
        <div className="splash-center">
          <span className="wordmark splash-wordmark">
            GAM<span className="dot">V</span>A
          </span>
          <div className="eyebrow splash-credit">by {CREATOR_NAME}</div>
        </div>
      </main>
    );
  }

  // ---------- Landing: 3 choices ----------
  if (screen === "landing") {
    return (
      <main className="shell">
        <div style={{ marginBottom: 28 }}>
          <span className="wordmark">
            GAM<span className="dot">V</span>A
          </span>
          <div className="eyebrow" style={{ marginTop: 4 }}>
            party games · no sign-in
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ marginBottom: 12 }}
          onClick={() => setScreen("create")}
        >
          Create room
        </button>
        <button
          className="btn btn-secondary"
          style={{ marginBottom: 12 }}
          onClick={() => setScreen("join")}
        >
          Join room
        </button>
        <button className="btn btn-secondary" onClick={() => setScreen("solo-soon")}>
          Solo play (vs AI)
        </button>
      </main>
    );
  }

  // ---------- Solo play placeholder ----------
  if (screen === "solo-soon") {
    return (
      <main className="shell">
        <button className="btn-ghost" style={{ marginBottom: 18 }} onClick={() => setScreen("landing")}>
          ← Back
        </button>
        <div className="card" style={{ textAlign: "center" }}>
          <div className="ticket-label" style={{ marginBottom: 10 }}>
            solo play · vs ai
          </div>
          <p style={{ color: "var(--ink-dim)" }}>
            Playing solo against an AI opponent is coming soon. For now, grab a
            friend and create or join a room.
          </p>
        </div>
      </main>
    );
  }

  // ---------- Create / Join form ----------
  const mode = screen; // "create" | "join"

  return (
    <main className="shell">
      <button className="btn-ghost" style={{ marginBottom: 18 }} onClick={() => setScreen("landing")}>
        ← Back
      </button>

      <div style={{ marginBottom: 28 }}>
        <span className="wordmark">
          GAM<span className="dot">V</span>A
        </span>
        <div className="eyebrow" style={{ marginTop: 4 }}>
          {mode === "create" ? "create a room" : "join a room"}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            placeholder="e.g. Priya"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
        </div>
        <div className="field" style={{ marginBottom: 4 }}>
          <label htmlFor="age">Your age</label>
          <input
            id="age"
            type="number"
            inputMode="numeric"
            placeholder="e.g. 24"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
      </div>

      {mode === "join" && (
        <div className="field">
          <label htmlFor="code">Room code</label>
          <input
            id="code"
            placeholder="e.g. K7QP"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={4}
            style={{ letterSpacing: "0.2em", fontFamily: "var(--font-mono)" }}
          />
        </div>
      )}

      {error && <div className="error-text">{error}</div>}

      <button
        className="btn btn-primary"
        disabled={loading}
        onClick={mode === "create" ? handleCreate : handleJoin}
      >
        {loading ? "One sec…" : mode === "create" ? "Create room" : "Join room"}
      </button>
    </main>
  );
}
