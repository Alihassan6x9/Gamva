import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Home, Gamepad2, Heart, Users, Star, User } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/games", label: "Games", icon: Gamepad2 },
    { href: "/couples", label: "Couples", icon: Heart },
    { href: "/family", label: "Family", icon: Users },
    { href: "/premium", label: "Premium", icon: Star },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const closeMenus = () => setMobileOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-white/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" onClick={closeMenus} className="wordmark text-xl hover:opacity-80 transition-opacity">
              GAM<span className="dot text-pink-500">V</span>A
            </Link>
          </div>

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
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 border-b border-slate-100 px-4 pt-2 pb-4 space-y-1 shadow-lg slide-up">
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
                {link.href === "/couples" && (
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">18+</span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
