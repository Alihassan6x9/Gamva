import { Link } from "wouter";
import { Twitter, Instagram, Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-12 border-t border-slate-200/50 bg-white/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2">
            <span className="wordmark text-xl mb-4 block">
              GAM<span className="dot text-pink-500">V</span>A
            </span>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              The premium multiplayer party game platform. Gather your friends, create a room, and start playing instantly.
            </p>
          </div>
          
          <div>
            <h3 className="font-mono text-xs tracking-widest uppercase text-slate-400 mb-4">Company</h3>
            <ul className="space-y-3 text-sm font-medium text-slate-600">
              <li><Link href="/about" className="hover:text-purple-600 transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-purple-600 transition-colors">Contact</Link></li>
              <li><Link href="/support" className="hover:text-purple-600 transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs tracking-widest uppercase text-slate-400 mb-4">Legal</h3>
            <ul className="space-y-3 text-sm font-medium text-slate-600">
              <li><Link href="/privacy" className="hover:text-purple-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-purple-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} ALBISS DEVELOPER (PAK). All rights reserved.
          </p>
          
          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="hover:text-purple-600 transition-colors"><Twitter size={18} /></a>
            <a href="#" className="hover:text-pink-600 transition-colors"><Instagram size={18} /></a>
            <a href="#" className="hover:text-slate-800 transition-colors"><Github size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
