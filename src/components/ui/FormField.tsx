import type { ReactNode } from "react";

export default function FormField({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <div>
            <label
                className="mb-1.5 block"
                style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "var(--c-muted)",
                }}
            >
                {label}

                {required && (
                    <span
                        style={{
                            marginLeft: 4,
                            color: "var(--c-red)",
                        }}
                    >
                        *
                    </span>
                )}
            </label>

            {children}
        </div>
    );
}
