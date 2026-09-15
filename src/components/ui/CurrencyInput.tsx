import type {
    ChangeEvent,
} from "react";

interface CurrencyInputProps {
    value: string;
    onChange: (value: string) => void;

    placeholder?: string;
    disabled?: boolean;
    required?: boolean;

    className?: string;
    style?: React.CSSProperties;
}

export default function CurrencyInput({
    value,
    onChange,
    placeholder = "0",
    disabled = false,
    required = false,
    className = "",
    style,
}: CurrencyInputProps) {
    const formatCurrency = (
        rawValue: string,
    ) => {
        const digits =
            rawValue.replace(
                /\D/g,
                "",
            );

        if (!digits) {
            return "";
        }

        return new Intl.NumberFormat(
            "id-ID",
        ).format(
            Number(digits),
        );
    };

    const handleChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const rawValue =
            event.target.value;

        const digits =
            rawValue.replace(
                /\D/g,
                "",
            );

        onChange(
            digits,
        );
    };

    const displayValue =
        value
            ? formatCurrency(value)
            : "";

    return (
        <div
            className={`relative ${className}`}
        >
            <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{
                    color:
                        "var(--c-muted)",
                }}
            >
                Rp
            </span>

            <input
                type="text"
                inputMode="numeric"
                value={
                    displayValue
                }
                onChange={
                    handleChange
                }
                placeholder={
                    placeholder
                }
                disabled={
                    disabled
                }
                required={
                    required
                }
                className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                style={
                    style
                }
            />
        </div>
    );
}