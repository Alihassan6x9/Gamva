import { Link } from "wouter";
import { User, Trophy, Medal, Gamepad2, Activity, Star } from "lucide-react";

export default function ProfilePage() {
  const name = localStorage.getItem("gamva:name") || "Guest Player";
  const initial = name.charAt(0).toUpperCase() || "?";

  return (
    <main className="shell fade-in">
      <div className="max-w-3xl mx-auto">
        
        {/* Profile Header */}
        <div className="card mb-8 relative overflow-hidden text-center pt-10 pb-8">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-400 to-pink-400 opacity-20"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white mb-4">
              <span className="text-3xl font-display font-bold text-white">{initial}</span>
            </div>
            
            <h1 className="font-display font-bold text-2xl text-slate-900 mb-1">{name}</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-purple-600 font-medium">
              <Star size={14} className="fill-purple-600" />
              Level 12 Player
            </div>
            
            <div className="mt-6 max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-slate-500 font-bold mb-1">
                <span>XP</span>
                <span>2,450 / 3,000</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[80%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center p-4">
            <div className="mx-auto w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-2">
              <Gamepad2 size={20} />
            </div>
            <div className="text-2xl font-display font-bold text-slate-900">42</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Games Played</div>
          </div>
          <div className="card text-center p-4">
            <div className="mx-auto w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-2">
              <Trophy size={20} />
            </div>
            <div className="text-2xl font-display font-bold text-slate-900">18</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Games Won</div>
          </div>
          <div className="card text-center p-4">
            <div className="mx-auto w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
              <Activity size={20} />
            </div>
            <div className="text-2xl font-display font-bold text-slate-900">43%</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Win Rate</div>
          </div>
          <div className="card text-center p-4">
            <div className="mx-auto w-10 h-10 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mb-2">
              <HeartIcon />
            </div>
            <div className="text-sm font-display font-bold text-slate-900 mt-2 truncate">This or That</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Favorite Game</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Achievements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-slate-800">Achievements</h2>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">Coming Soon</span>
            </div>
            <div className="card opacity-60">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                  <Medal size={24} />
                </div>
                <div>
                  <div className="font-bold text-slate-700">First Victory</div>
                  <div className="text-xs text-slate-500">Win your first game.</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                  <UsersIcon />
                </div>
                <div>
                  <div className="font-bold text-slate-700">Party Host</div>
                  <div className="text-xs text-slate-500">Create 5 rooms.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-slate-800">Recent Activity</h2>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">Placeholder</span>
            </div>
            <div className="card space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div>
                  <div className="font-bold text-sm text-slate-700">Played <span className="text-purple-600">This or That</span></div>
                  <div className="text-xs text-slate-500">Room Code: K7QP</div>
                </div>
                <div className="text-xs text-slate-400 font-mono">2 hrs ago</div>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div>
                  <div className="font-bold text-sm text-slate-700">Created a room</div>
                  <div className="text-xs text-slate-500">Waiting in lobby...</div>
                </div>
                <div className="text-xs text-slate-400 font-mono">Yesterday</div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-8">Stats are illustrative for now. Full account sync coming in V2.</p>
      </div>
    </main>
  );
}

function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
}
