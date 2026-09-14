import { Link, useNavigate } from "react-router-dom";

import { LogoMark } from "@/components/ui/Logo";
import { LoginForm } from "@/features/Auth/components/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--c-bg)]">
      {/* MOBILE */}
      <div className="md:hidden min-h-screen flex flex-col">
        <div className="relative h-44 shrink-0 overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2448] to-[#0a1628]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgba(61,127,255,0.2) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.15) 0%, transparent 50%)",
            }}
          />

          <div className="relative flex flex-col items-center justify-center h-full text-center px-6">
            <LogoMark size={40} />

            <div className="text-xl font-extrabold text-white tracking-tight mt-3">
              Nexora
            </div>

            <div className="text-[10px] font-mono text-blue-300/60 tracking-[0.15em] uppercase mt-1">
              Distribution Platform
            </div>
          </div>
        </div>

        <div className="flex-1 -mt-6 px-5 pb-8">
          <div className="bg-[var(--c-surface)] rounded-2xl border border-[var(--c-border)] p-6 shadow-lg fade-in">
            <h1 className="text-lg font-bold text-[var(--c-text)] m-0 mb-1">
              Welcome back
            </h1>

            <p className="text-[12.5px] text-[var(--c-muted)] m-0 mb-6">
              Sign in to continue
            </p>

            <LoginForm
              onSuccess={() =>
                navigate("/dashboard")
              }
            />

            <p className="text-[12.5px] text-[var(--c-muted)] text-center mt-5">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[var(--c-accent)] font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:flex min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center p-10">
          <div className="w-full max-w-[400px] fade-in">
            <div className="flex items-center gap-2 mb-10">
              <LogoMark size={36} />

              <div>
                <div className="text-xl font-extrabold tracking-tight text-[var(--c-text)] leading-none">
                  Nexora
                </div>

                <div className="text-[10px] font-mono text-[var(--c-dim)] tracking-wider uppercase">
                  Distribution
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-[var(--c-text)] mb-1.5">
              Sign in to your account
            </h1>

            <p className="text-[13.5px] text-[var(--c-muted)] mb-8">
              Enter your credentials to access the platform.
            </p>

            <LoginForm
              onSuccess={() =>
                navigate("/dashboard")
              }
            />

            <p className="text-[12.5px] text-[var(--c-muted)] text-center mt-6">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[var(--c-accent)] font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12 relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2448] to-[#0a1628]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgba(61,127,255,0.15) 0%, transparent 60%), radial-gradient(circle at 70% 70%, rgba(6,182,212,0.1) 0%, transparent 50%)",
            }}
          />

          <div className="relative text-center max-w-[380px]">
            <div className="text-[11px] font-mono text-blue-300/60 tracking-[0.15em] uppercase mb-6">
              B2B Distribution Platform
            </div>

            <h2 className="text-3xl font-bold text-white leading-tight tracking-tight mb-5">
              The intelligent platform for modern distribution.
            </h2>

            <p className="text-sm text-blue-100/70 leading-relaxed mb-8">
              Manage orders, inventory, warehouses,
              and shipments — all in one platform
              built for enterprise B2B operations.
            </p>

            <div className="flex flex-col gap-3">
              {[
                ["1,284", "Active Orders"],
                ["6.2M", "Inventory Value"],
                ["96.3%", "On-Time Delivery"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <span className="text-xs text-blue-100/60">
                    {label}
                  </span>

                  <span className="font-mono text-lg font-semibold text-white">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}