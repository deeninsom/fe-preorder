import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { useNotification } from "@/contexts/NotificationContext";

interface LoginFormProps {
    onSuccess?: () => void;
}

export function LoginForm({
    onSuccess,
}: LoginFormProps) {
    const { login } = useAuth();
    const { success, error: toastError } =
        useNotification();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);

    const fillDemo = (
        role: "admin" | "owner"
    ) => {
        if (role === "admin") {
            setEmail("admin@meridian.com");
            setPassword("password123");
            return;
        }

        setEmail("owner@distroos.com");
        setPassword("owner123");
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!email || !password) {
            toastError(
                "Validation error",
                "Please fill in all fields."
            );

            return;
        }

        setLoading(true);

        const result = await login({
            email,
            password,
        });

        setLoading(false);

        if (!result.ok) {
            toastError(
                "Login failed",
                result.error ?? "Invalid credentials."
            );

            return;
        }

        success(
            "Welcome back!",
            `Signed in as ${email}`
        );

        onSuccess?.();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
        >
            <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">
                    Email address
                </label>

                <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="w-full py-2.5 px-3.5 rounded-lg border border-white/10 bg-white/5 text-slate-200 text-[13.5px] outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all placeholder:text-slate-500"
                />
            </div>

            <div>
                <label className="text-xs font-medium text-slate-400 block mb-1.5">
                    Password
                </label>

                <div className="relative">
                    <input
                        type={
                            showPassword
                                ? "text"
                                : "password"
                        }
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full py-2.5 pr-10 pl-3.5 rounded-lg border border-white/10 bg-white/5 text-slate-200 text-[13.5px] outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all placeholder:text-slate-500"
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowPassword((value) => !value)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        {showPassword ? (
                            <EyeOff size={15} />
                        ) : (
                            <Eye size={15} />
                        )}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white text-sm font-bold border-none mt-2 transition-all shadow-lg ${loading
                        ? "bg-slate-700 cursor-not-allowed opacity-70"
                        : "bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 cursor-pointer shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
                    }`}
            >
                {loading
                    ? "Signing in…"
                    : "Sign in"}
            </button>

            <div className="flex gap-2 mt-2">
                <button
                    type="button"
                    onClick={() => fillDemo("admin")}
                    className="flex-1 py-2 px-3 rounded-lg border border-white/5 bg-white/5 text-[11.5px] text-slate-400 font-mono hover:bg-white/10 hover:text-slate-200 transition-colors"
                >
                    Demo: Admin
                </button>

                <button
                    type="button"
                    onClick={() => fillDemo("owner")}
                    className="flex-1 py-2 px-3 rounded-lg border border-white/5 bg-white/5 text-[11.5px] text-slate-400 font-mono hover:bg-white/10 hover:text-slate-200 transition-colors"
                >
                    Demo: Owner
                </button>
            </div>
        </form>
    );
}