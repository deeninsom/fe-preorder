import { Link, useNavigate } from "react-router-dom";

import { LogoMark } from "@/components/ui/Logo";
import { LoginForm } from "@/features/Auth/components/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--c-bg)] relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Animated Background */}
      <div
        className="absolute inset-0 z-0 opacity-50 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(217, 70, 239, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
          `,
        }}
      />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] z-0 pointer-events-none" />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10 animate-[fade-in_0.5s_ease-out]">
        <div className="flex flex-col items-center justify-center text-center">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <LogoMark size={48} />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Sign in to your account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-[fade-in_0.7s_ease-out]">
        <div className="bg-white/[0.03] border border-white/10 py-8 px-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl sm:rounded-2xl sm:px-10">
          <LoginForm onSuccess={() => navigate("/dashboard")} />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent backdrop-blur-md text-slate-400">
                  New to Nexora?
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                to="/register"
                className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}