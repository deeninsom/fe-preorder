import { Link, useNavigate } from "react-router-dom";
import { Coffee } from "lucide-react"; // Using an icon to mimic the dashboard feel

import { LogoMark } from "@/components/ui/Logo";
import { LoginForm } from "@/features/Auth/components/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--c-bg)] flex font-sans text-[var(--c-text)]">
      {/* Left Form Section */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-fade-in">
          <div className="mb-8">
            <Link to="/" className="inline-block hover:scale-105 transition-transform">
              <LogoMark size={40} className="text-[var(--c-accent)]" />
            </Link>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-[var(--c-muted)]">
              Sign in to manage your preorders
            </p>
          </div>

          <div className="mt-8">
            <LoginForm onSuccess={() => navigate("/dashboard")} />
            
            <div className="mt-6 text-center text-sm">
              <span className="text-[var(--c-muted)]">New here? </span>
              <Link
                to="/register"
                className="font-semibold text-[var(--c-accent)] hover:text-[var(--c-accent)]/80 transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image/Graphic Section */}
      <div className="hidden lg:flex lg:flex-1 relative bg-[var(--c-surface2)] overflow-hidden items-center justify-center border-l border-[var(--c-border)]">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--c-accent-bg)] to-transparent opacity-50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--c-accent)]/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[var(--c-surface)] to-transparent opacity-30" />
        
        {/* Floating Content */}
        <div className="relative z-10 text-center max-w-md mx-auto px-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="w-24 h-24 mx-auto bg-white dark:bg-[var(--c-surface)] rounded-2xl shadow-xl flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform duration-500 border border-[var(--c-border)]">
            <Coffee size={40} className="text-[var(--c-accent)]" />
          </div>
          <h3 className="text-2xl font-bold mb-4">PO Jadi Lebih Rapi</h3>
          <p className="text-[var(--c-muted)] text-lg leading-relaxed">
            Manage your incoming preorders, track payments, and grow your business with a beautiful and modern workspace.
          </p>
        </div>
      </div>
    </div>
  );
}