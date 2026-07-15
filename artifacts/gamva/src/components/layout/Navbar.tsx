import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Music, Volume2, VolumeX, Home, Gamepad2, Heart, Users, Star, User } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const { playing, volume, muted, togglePlay, toggleMute, setVolume } = useAudio();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/games", label: "Games", icon: Gamepad2 },
    { href: "/couples", label: "Couples", icon: Heart },
    { href: "/family", label: "Family", icon: Users },
    { href: "/premium", label: "Premium", icon: Star },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const closeMenus = () => {
    setMobileOpen(false);
    setMusicOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" onClick={closeMenus} className="wordmark text-xl hover:opacity-80 transition-opacity">
                GAM<span className="dot text-pink-500">V</span>A
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-xl text-sm font-bold font-display transition-colors flex items-center gap-2 ${
                      isActive 
                        ? "bg-purple-100 text-purple-700" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}

              <div className="h-6 w-px bg-slate-200 mx-2" />

              {/* Music Button */}
              <div className="relative">
                <button
                  onClick={() => setMusicOpen(!musicOpen)}
                  className={`p-2 rounded-xl transition-colors ${
                    playing && !muted ? "text-purple-600 bg-purple-50" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {muted || !playing ? <VolumeX size={20} /> : <Music size={20} />}
                </button>
                
                {/* Music Popover */}
                {musicOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-4 slide-up">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-display font-bold text-sm">Background Music</span>
                      <button onClick={togglePlay} className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                        {playing ? "Pause" : "Play"}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={toggleMute} className="text-slate-500 hover:text-slate-800">
                        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={muted ? 0 : volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMusicOpen(!musicOpen)}
                className={`p-2 rounded-xl transition-colors ${
                  playing && !muted ? "text-purple-600 bg-purple-50" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {muted || !playing ? <VolumeX size={20} /> : <Music size={20} />}
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 pt-2 pb-4 space-y-1 shadow-lg slide-up">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenus}
                  className={`block px-4 py-3 rounded-xl text-base font-bold font-display transition-colors flex items-center gap-3 ${
                    isActive 
                      ? "bg-purple-100 text-purple-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                  {link.href === "/couples" && <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">18+</span>}
                </Link>
              );
            })}
          </div>
        )}

        {/* Mobile Music Popover (Rendered below header if active in mobile, but we handle it via state similarly) */}
        {musicOpen && mobileOpen && (
          <div className="md:hidden bg-slate-50 border-b border-slate-100 p-4 slide-up">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-bold text-sm">Background Music</span>
              <button onClick={togglePlay} className="text-xs font-bold px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors">
                {playing ? "Pause" : "Play"}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleMute} className="text-slate-500 hover:text-slate-800">
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        )}
      </nav>

      {/* Mobile standalone music popover if menu closed */}
      {musicOpen && !mobileOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 p-4 shadow-lg slide-up">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display font-bold text-sm">Background Music</span>
            <button onClick={togglePlay} className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              {playing ? "Pause" : "Play"}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="text-slate-500 hover:text-slate-800">
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      )}
    </>
  );
}
