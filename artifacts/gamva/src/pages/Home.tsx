import { useState, useEffect } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { ref, set, get, serverTimestamp } from "firebase/database";
import { db, ensureSignedIn, isFirebaseConfigured } from "@/lib/firebase";
import { generateRoomCode, normalizeRoomCode, generatePlayerId } from "@/lib/roomCode";
import { Gamepad2, Users, Crown, ArrowRight, CheckCircle2 } from "lucide-react";
import GameCard from "@/components/shared/GameCard";

const AGE_MIN = 13;
const CREATOR_NAME = "ALBISS DEVELOPER (PAK)";

type Screen = "splash" | "landing" | "create" | "join" | "solo-soon";

export default function HomePage() {
  const [, navigate] = useLocation();
  const search = useSearch();

  const [selectedGame, setSelectedGame] = useState("this-or-that");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState<Screen>("splash");

  useEffect(() => {
    const searchParams = new URLSearchParams(search);
    const gameParam = searchParams.get("game");

    if (gameParam) {
      setSelectedGame(gameParam);
    }

    const alreadySeen = sessionStorage.getItem("gamva:splashSeen");
    const joinParam = searchParams.get("join");

    if (joinParam) setJoinCode(joinParam.toUpperCase());

    const savedName = localStorage.getItem("gamva:name");
    const savedAge = localStorage.getItem("gamva:age");

    if (savedName) setName(savedName);
    if (savedAge) setAge(savedAge);

    if (alreadySeen) {
      setScreen(joinParam ? "join" : "landing");
      return;
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem("gamva:splashSeen", "1");
      setScreen(joinParam ? "join" : "landing");
    }, 2800);

    return () => clearTimeout(timer);
  }, [search]);

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

        gameType:
          selectedGame === "truth-or-dare-18"
            ? "truth-or-dare"
            : "this-or-that",

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
      navigate(`/room/${code}`);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error && !isFirebaseConfigured
          ? err.message
          : "Couldn't create the room. Check your connection and try again."
      );
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
      const existingPlayerCount = room.players
        ? Object.keys(room.players).length
        : 0;
      if (existingPlayerCount >= 2) {
        setError("Room is full. Only 2 players are allowed.");
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
      navigate(`/room/${code}`);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error && !isFirebaseConfigured
          ? err.message
          : "Couldn't join the room. Check your connection and try again."
      );
      setLoading(false);
    }
  }

  // ---------- Splash ----------
  if (screen === "splash") {
    return (
      <main className="splash-screen flex flex-col">
        <div className="splash-center">
          <span className="splash-wordmark font-display font-extrabold tracking-tight">
            GAM<span className="dot">V</span>A
          </span>
          <div className="splash-credit text-sm font-mono tracking-widest uppercase">by {CREATOR_NAME}</div>
        </div>
      </main>
    );
  }

  // ---------- Form view (Create/Join/Solo) ----------
  if (screen === "create" || screen === "join" || screen === "solo-soon") {
    const mode = screen;

    if (mode === "solo-soon") {
      return (
        <main className="shell-sm w-full py-12 fade-in">
          <button className="btn-ghost mb-6 flex items-center gap-1" onClick={() => setScreen("landing")}>
            
