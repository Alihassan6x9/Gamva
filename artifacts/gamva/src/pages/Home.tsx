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

  const [screen, setScreen] = useState<Screen>("splash");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("gamva:splashSeen");
    const searchParams = new URLSearchParams(search);
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
      const playerKeys = Object.keys(room.players || {});

      console.log("Room:", room);
      console.log("Player Keys:", playerKeys);
      console.log("Player Count:", playerKeys.length);
      const existingPlayerCount = playerKeys.length;
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
            <ArrowLeftIcon /> Back
          </button>
          <div className="card text-center py-10">
            <div className="ticket-label mb-4">solo play · vs ai</div>
            <div className="mx-auto w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <Gamepad2 size={32} />
            </div>
            <h2 className="font-display font-bold text-2xl mb-2 text-slate-800">Coming Soon</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Playing solo against an AI opponent is in development. For now, grab a friend and create or join a room.
            </p>
          </div>
        </main>
      );
    }

    return (
      <main className="shell-sm w-full py-12 fade-in">
        <button className="btn-ghost mb-6 flex items-center gap-1" onClick={() => setScreen("landing")}>
          <ArrowLeftIcon /> Back
        </button>

        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-slate-900 mb-1">
            {mode === "create" ? "Create a room" : "Join a room"}
          </h1>
          <p className="text-slate-500">
            {mode === "create" ? "Set up your profile to start hosting." : "Enter your details and the invite code."}
          </p>
        </div>

        <div className="card mb-6 shadow-sm border-purple-100">
          <div className="field">
            <label htmlFor="name">Your nickname</label>
            <input
              id="name"
              placeholder="e.g. Priya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
          </div>
          <div className="field mb-1">
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
          <div className="card mb-6 bg-slate-50/50 border-blue-100">
            <div className="field mb-1">
              <label htmlFor="code">Room code</label>
              <input
                id="code"
                placeholder="e.g. K7QP"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={4}
                className="text-center text-2xl tracking-[0.2em] font-mono uppercase"
              />
            </div>
          </div>
        )}

        {error && <div className="error-text shadow-sm">{error}</div>}

        <button
          className="btn btn-primary shadow-xl shadow-purple-200"
          disabled={loading}
          onClick={mode === "create" ? handleCreate : handleJoin}
        >
          {loading ? "Connecting..." : mode === "create" ? "Create room" : "Join room"}
          {!loading && <ArrowRight size={18} />}
        </button>
      </main>
    );
  }

  // ---------- Landing: Hero + Actions + Showcase ----------
  return (
    <main className="shell px-0 md:px-6 w-full fade-in">
      {/* Hero Section */}
      <div className="px-6 md:px-0 text-center max-w-3xl mx-auto mb-16 pt-8">
        <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
          <Crown size={14} className="text-purple-600" /> V1.0 Live Now
        </span>
        <h1 className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-tight text-slate-900 mb-6 leading-tight">
          Party games for <br className="hidden md:block"/>
          <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">everywhere.</span>
        </h1>
        <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
          Play premium multiplayer party games directly in your browser. Live voice and video built right in. No app download required.
        </p>
        
        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto">
          <button 
            onClick={() => setScreen("create")}
            className="group relative bg-white border border-purple-200 rounded-2xl p-6 text-left shadow-lg shadow-purple-100 hover:shadow-xl hover:shadow-purple-200 hover:-translate-y-1 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900 mb-1">Create Room</h3>
            <p className="text-sm text-slate-500">Host a game for your friends.</p>
          </button>

          <button 
            onClick={() => setScreen("join")}
            className="group relative bg-white border border-blue-200 rounded-2xl p-6 text-left shadow-lg shadow-blue-100 hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-1 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Gamepad2 size={24} />
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900 mb-1">Join Room</h3>
            <p className="text-sm text-slate-500">Have a code? Jump right in.</p>
          </button>
        </div>

        <button 
          onClick={() => setScreen("solo-soon")}
          className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Looking for solo play?
        </button>
      </div>

      {/* Trust markers / features */}
      <div className="px-6 md:px-0 py-8 border-y border-slate-200/50 bg-white/30 backdrop-blur-sm mb-16">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
            <CheckCircle2 size={18} className="text-emerald-500" /> No signup required
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
            <CheckCircle2 size={18} className="text-emerald-500" /> Integrated voice & video
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
            <CheckCircle2 size={18} className="text-emerald-500" /> Real-time multiplayer
          </div>
        </div>
      </div>

      {/* Featured Game Showcase */}
      <div className="px-6 md:px-0 max-w-5xl mx-auto mb-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-3xl text-slate-900 mb-2">Popular Right Now</h2>
            <p className="text-slate-500">The games everyone is playing.</p>
          </div>
          <Link href="/games" className="hidden md:flex text-sm font-bold text-purple-600 hover:text-purple-700 items-center gap-1">
            See all games <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GameCard 
            title="This or That" 
            description="A fast-paced game of difficult choices. See how your answers stack up." 
            slug="this-or-that" 
            isPlayable 
            colorClass="from-pink-500 to-orange-400"
          />
          <GameCard 
            title="Truth or Dare 18+" 
            description="Turn up the heat. Premium adult edition." 
            slug="truth-or-dare-18" 
            is18Plus
            colorClass="from-red-500 to-rose-500"
          />
          <div className="md:hidden lg:block">
            <GameCard 
              title="Family Quiz" 
              description="Test your general knowledge with wholesome family-friendly trivia." 
              slug="family-quiz" 
              colorClass="from-cyan-400 to-blue-400"
            />
          </div>
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/games" className="btn btn-secondary inline-flex w-auto px-8">
            View all games
          </Link>
        </div>
      </div>

    </main>
  );
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
  );
}
