import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { useAuth } from "@/features/Auth/hooks/useAuth";
import { useNotification } from "@/contexts/NotificationContext";

interface RegisterFormProps {
    onSuccess?: () => void;
}

export function RegisterForm({
    onSuccess,
}: RegisterFormProps) {
    const { register } = useAuth();
    const { success, error: toastError } = useNotification();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        pass: "",
        confirm: "",
    });

    const [loading, setLoading] = useState(false);

    const set =
        (key: keyof typeof form) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((current) => ({
                    ...current,
                    [key]: e.target.value,
                }));
            };

    const checks = [
        {
            label: "At least 8 characters",
            ok: form.pass.length >= 8,
        },
        {
            label: "Contains a number",
            ok: /\d/.test(form.pass),
        },
        {
            label: "Passwords match",
            ok:
                form.pass === form.confirm &&
                form.confirm.length > 0,
        },
    ];

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (
            !form.name ||
            !form.email ||
            !form.pass ||
            !form.confirm
        ) {
            toastError(
                "Validation error",
                "Please fill in all required fields."
            );
            return;
        }

        if (form.pass !== form.confirm) {
            toastError(
                "Validation error",
                "Passwords do not match."
            );
            return;
        }

        if (form.pass.length < 8) {
            toastError(
                "Validation error",
                "Password must be at least 8 characters."
            );
            return;
        }

        setLoading(true);

        try {
            const res = await register({
                name: form.name,
                email: form.email,
                password: form.pass,
                phone: form.phone,
            });

            if (!res.ok) {
                toastError(
                    "Registration failed",
                    res.error ?? "Something went wrong."
                );
                return;
            }

            success(
                "Account created!",
                "Welcome to Nexora Distribution."
            );

            onSuccess?.();
        } catch {
            toastError(
                "Registration failed",
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const fields: {
        key: keyof typeof form;
        label: string;
        type: string;
        placeholder: string;
        required?: boolean;
    }[] = [
            {
                key: "name",
                label: "Full name",
                type: "text",
                placeholder: "Jane Smith",
                required: true,
            },
            {
                key: "email",
                label: "Work email",
                type: "email",
                placeholder: "jane@company.com",
                required: true,
            },
            {
                key: "phone",
                label: "Phone number",
                type: "tel",
                placeholder: "08123456789",
                required: false,
            },
            {
                key: "pass",
                label: "Password",
                type: "password",
                placeholder: "••••••••",
                required: true,
            },
            {
                key: "confirm",
                label: "Confirm password",
                type: "password",
                placeholder: "••••••••",
                required: true,
            },
        ];

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3.5"
        >
            {fields.map(
                ({
                    key,
                    label,
                    type,
                    placeholder,
                    required,
                }) => (
                    <div key={key}>
                        <label
                            htmlFor={key}
                            className="text-[12px] font-medium text-[var(--c-muted)] block mb-1.5"
                        >
                            {label}

                            {required && (
                                <span className="text-[var(--c-accent)] ml-0.5">
                                    *
                                </span>
                            )}

                            {!required && (
                                <span className="text-[var(--c-dim)] ml-1">
                                    (Optional)
                                </span>
                            )}
                        </label>

                        <input
                            id={key}
                            type={type}
                            value={form[key]}
                            onChange={set(key)}
                            placeholder={placeholder}
                            autoComplete={
                                key === "pass" ||
                                    key === "confirm"
                                    ? "new-password"
                                    : key
                            }
                            className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--c-surface2)] border border-[var(--c-border)] text-[13px] text-[var(--c-text)] outline-none focus:border-[var(--c-accent)] transition-colors"
                        />
                    </div>
                )
            )}

            {form.pass.length > 0 && (
                <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-[var(--c-surface2)] fade-in">
                    {checks.map((check) => (
                        <div
                            key={check.label}
                            className={`flex items-center gap-1.5 text-[11.5px] ${check.ok
                                    ? "text-[var(--c-green)]"
                                    : "text-[var(--c-dim)]"
                                }`}
                        >
                            <CheckCircle2 size={12} />
                            <span>{check.label}</span>
                        </div>
                    ))}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-lg text-[14px] text-white font-semibold border-none mt-1 transition-all ${loading
                        ? "bg-[var(--c-accent-bg)] cursor-not-allowed opacity-70"
                        : "bg-[var(--c-accent)] cursor-pointer hover:opacity-90"
                    }`}
            >
                {loading
                    ? "Creating account…"
                    : "Create account"}
            </button>
        </form>
    );
}
