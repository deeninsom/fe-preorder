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
        store_name: "",
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
            label: "At least 6 characters",
            ok: form.pass.length >= 6,
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
            !form.store_name ||
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

        if (form.pass.length < 6) {
            toastError(
                "Validation error",
                "Password must be at least 6 characters."
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
                store_name: form.store_name,
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
                "Welcome to Nexora Preorder."
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
                key: "store_name",
                label: "Store name",
                type: "text",
                placeholder: "Toko Maju Jaya",
                required: true,
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
                            className="text-sm font-medium text-[var(--c-text)] block mb-1.5"
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
                            className="w-full py-2.5 px-3.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-text)] text-[14px] outline-none focus:border-[var(--c-accent)] focus:ring-2 focus:ring-[var(--c-accent)]/20 transition-all placeholder:text-[var(--c-dim)] shadow-sm"
                        />
                    </div>
                )
            )}

            {form.pass.length > 0 && (
                <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-[var(--c-border)] bg-[var(--c-surface2)] fade-in">
                    {checks.map((check) => (
                        <div
                            key={check.label}
                            className={`flex items-center gap-1.5 text-xs ${check.ok
                                ? "text-[var(--c-accent)] font-medium"
                                : "text-[var(--c-muted)]"
                                }`}
                        >
                            <CheckCircle2 size={14} className={check.ok ? "text-[var(--c-accent)]" : "text-[var(--c-dim)]"} />
                            <span>{check.label}</span>
                        </div>
                    ))}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white text-sm font-semibold border-none mt-2 transition-all shadow-md ${loading
                    ? "bg-[var(--c-surface3)] cursor-not-allowed opacity-70 text-[var(--c-text)] shadow-none"
                    : "bg-[var(--c-accent)] hover:bg-[var(--c-accent)]/90 cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
                    }`}
            >
                {loading
                    ? "Creating account…"
                    : "Create account"}
            </button>
        </form>
    );
}
