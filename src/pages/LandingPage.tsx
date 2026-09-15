import { Link } from "react-router-dom";
import { ArrowRight, Box, Globe, Shield, Zap } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--c-bg)] relative overflow-hidden flex flex-col font-sans">
      {/* Dynamic Background */}
      <div
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 15% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 85% 30%, rgba(217, 70, 239, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(79, 70, 229, 0.15) 0%, transparent 50%)
          `,
        }}
      />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] z-0 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 py-6 px-8 flex justify-between items-center border-b border-white/5 bg-black/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <LogoMark size={32} />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-white tracking-tight leading-none">Nexora</span>
            <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase mt-1">Preorder</span>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-cyan-300 mb-8 backdrop-blur-sm animate-[fade-in_0.5s_ease-out]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          Nexora Preorder 2.0 is Live
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-indigo-200 tracking-tight mb-6 max-w-4xl mx-auto animate-[fade-in_0.7s_ease-out]">
          The Intelligent Platform for Modern Preorders
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-[fade-in_0.9s_ease-out]">
          Manage orders, track inventory across warehouses, and streamline your entire B2B preorder workflow with our state-of-the-art intelligent dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-[fade-in_1.1s_ease-out]">
          <Link
            to="/register"
            className="group flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 bg-[length:200%_auto] hover:bg-[position:right_center] transition-all shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1"
          >
            Start Free Trial
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 rounded-full text-base font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
          >
            View Demo
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mt-24 animate-[fade-in_1.3s_ease-out]">
          {[
            { icon: Globe, title: "Global Reach", desc: "Connect with warehouses and suppliers worldwide instantly." },
            { icon: Zap, title: "Lightning Fast", desc: "Optimized workflows to process preorders in milliseconds." },
            { icon: Shield, title: "Secure B2B", desc: "Enterprise-grade security protecting your trade data." }
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/10 transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 group-hover:text-cyan-300 transition-all">
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
