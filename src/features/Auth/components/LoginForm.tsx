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
                <label className="text-xs font-medium text-[var(--c-muted)] block mb-1.5">
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
                    className="w-full py-2.5 px-3.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] text-[13.5px] outline-none focus:border-[var(--c-accent)] transition-colors"
                />
            </div>

            <div>
                <label className="text-xs font-medium text-[var(--c-muted)] block mb-1.5">
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
                        className="w-full py-2.5 pr-10 pl-3.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] text-[13.5px] outline-none focus:border-[var(--c-accent)] transition-colors"
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowPassword((value) => !value)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--c-dim)]"
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
                className={`py-2.5 px-5 rounded-lg text-white text-sm font-semibold border-none mt-1 transition-opacity ${loading
                        ? "bg-[var(--c-accent-bg)] cursor-not-allowed opacity-70"
                        : "bg-[var(--c-accent)] cursor-pointer hover:opacity-90"
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
                    className="flex-1 py-1.5 px-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] text-[11.5px] text-[var(--c-muted)] font-mono hover:bg-[var(--c-surface3)] transition-colors"
                >
                    Demo: Admin
                </button>

                <button
                    type="button"
                    onClick={() => fillDemo("owner")}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] text-[11.5px] text-[var(--c-muted)] font-mono hover:bg-[var(--c-surface3)] transition-colors"
                >
                    Demo: Owner
                </button>
            </div>
        </form>
    );
}