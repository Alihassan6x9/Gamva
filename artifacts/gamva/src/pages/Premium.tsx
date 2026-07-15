import { useState } from "react";
import { Check, Star, CreditCard } from "lucide-react";
import { SiGooglepay, SiApplepay } from "react-icons/si";

export default function PremiumPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  const handleCheckout = () => {
    alert("Payment processing coming soon!");
  };

  return (
    <main className="shell fade-in">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
          <Star size={12} className="fill-yellow-900" />
          Gamva Premium
        </span>
        <h1 className="font-display font-bold text-4xl mb-4 text-slate-900">
          Unlock the ultimate party experience
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Get access to all premium games, remove player limits, and unlock exclusive features.
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <div className="bg-slate-100 p-1 rounded-xl inline-flex relative">
          <button 
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${billing === "monthly" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </button>
          <button 
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${billing === "yearly" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
            onClick={() => setBilling("yearly")}
          >
            Yearly <span className="text-emerald-500 ml-1">-20%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {/* Features List */}
        <div className="card">
          <h3 className="font-display font-bold text-xl mb-6">Everything you get</h3>
          <ul className="space-y-4">
            {[
              "Unlimited players per room",
              "Access to all 18+ Couples games",
              "Access to all Family games",
              "Ad-free experience forever",
              "Exclusive premium avatars",
              "Priority support access"
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-600">
                <div className="mt-0.5 bg-emerald-100 text-emerald-600 p-1 rounded-full shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Checkout Card */}
        <div className="card relative overflow-hidden border-purple-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400 opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400 opacity-10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <h3 className="font-display font-bold text-xl mb-2">
              {billing === "yearly" ? "Yearly Plan" : "Monthly Plan"}
            </h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-display font-extrabold text-slate-900">
                ${billing === "yearly" ? "4.99" : "6.99"}
              </span>
              <span className="text-slate-500">/mo</span>
            </div>
            
            {billing === "yearly" && (
              <p className="text-sm text-slate-500 mb-6 pb-6 border-b border-slate-100">
                Billed $59.88 annually. Cancel anytime.
              </p>
            )}

            <div className="space-y-3 mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select payment method</p>
              
              <button onClick={handleCheckout} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                <span className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                  <CreditCard size={18} className="text-slate-400" />
                  Credit/Debit Card
                </span>
              </button>

              <button onClick={handleCheckout} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                <span className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                  <div className="w-6 h-4 bg-emerald-500 rounded text-white flex items-center justify-center text-[10px] font-bold">EP</div>
                  Easypaisa
                </span>
              </button>

              <button onClick={handleCheckout} className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-colors">
                <span className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                  <div className="w-6 h-4 bg-red-600 rounded text-white flex items-center justify-center text-[10px] font-bold">JC</div>
                  JazzCash
                </span>
              </button>
            </div>

            <button onClick={handleCheckout} className="btn btn-primary w-full shadow-lg">
              Subscribe Now
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">Secure encrypted checkout.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
