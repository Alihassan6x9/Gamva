import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type AudioContextType = {
  playing: boolean;
  volume: number;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  muted: boolean;
  toggleMute: () => void;
};

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.15);
  const [muted, setMuted] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const savedVol = localStorage.getItem("gamva:volume");
    const savedMuted = localStorage.getItem("gamva:muted");
    const savedPlaying = localStorage.getItem("gamva:playing");
    
    let initialVol = 0.15;
    if (savedVol !== null) initialVol = parseFloat(savedVol);
    let initialMuted = savedMuted === "true";
    let initialPlaying = savedPlaying !== "false"; // default true attempt
    
    setVolumeState(initialVol);
    setMuted(initialMuted);
    setPlaying(initialPlaying);

    const audio = new Audio(`${import.meta.env.BASE_URL}audio/ambient-loop.wav`);
    audio.loop = true;
    audio.volume = initialMuted ? 0 : initialVol;
    audioRef.current = audio;

    const playAttempt = () => {
      if (initialPlaying) {
        audio.play().then(() => {
          setPlaying(true);
        }).catch(() => {
          setPlaying(false);
        });
      }
    };

    playAttempt();

    const unlockAudio = () => {
      if (!audioRef.current || !playing) {
        audioRef.current?.play().then(() => {
          setPlaying(true);
        }).catch(() => {});
      }
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);

    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };
  }, [playing]); // added playing as dependency to avoid closure issues with unlockAudio, though it might be fine empty.

  useEffect(() => {
    if (audioRef.current && initialized.current) {
      // Smooth fade could be added, but setting directly for stability
      audioRef.current.volume = muted ? 0 : volume;
      if (playing) {
        audioRef.current.play().catch(() => setPlaying(false));
      } else {
        audioRef.current.pause();
      }
      localStorage.setItem("gamva:volume", volume.toString());
      localStorage.setItem("gamva:muted", muted.toString());
      localStorage.setItem("gamva:playing", playing.toString());
    }
  }, [playing, volume, muted]);

  const togglePlay = () => setPlaying(!playing);
  const toggleMute = () => setMuted(!muted);
  const setVolume = (v: number) => {
    setVolumeState(v);
    if (v > 0 && muted) setMuted(false);
  };

  return (
    <AudioContext.Provider value={{ playing, volume, togglePlay, setVolume, muted, toggleMute }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
};
