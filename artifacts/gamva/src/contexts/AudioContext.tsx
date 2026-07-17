import React, { createContext, useContext, useState } from "react";

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
  // Background audio has been removed. These are kept as inert state so any
  // component still calling useAudio() (e.g. a mute button in the Navbar)
  // doesn't break — they just have no audible effect anymore.
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.15);
  const [muted, setMuted] = useState(false);

  const togglePlay = () => setPlaying((p) => !p);
  const toggleMute = () => setMuted((m) => !m);
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
