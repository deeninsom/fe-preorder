interface LogoMarkProps {
  size?: number;
}

export function LogoMark({ size = 32 }: LogoMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="var(--c-accent)" />
      {/* top-left node */}
      <circle cx="9.5" cy="10" r="2.5" fill="white" />
      {/* top-right node */}
      <circle cx="22.5" cy="10" r="2.5" fill="white" />
      {/* bottom-center node */}
      <circle cx="16" cy="22" r="2.5" fill="white" />
      {/* edges */}
      <line x1="9.5" y1="10" x2="22.5" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
      <line x1="9.5" y1="10" x2="16" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
      <line x1="22.5" y1="10" x2="16" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
      {/* center dot */}
      <circle cx="16" cy="14" r="1.5" fill="white" opacity="0.4" />
    </svg>
  );
}

interface LogoFullProps {
  size?: number;
}

export function LogoFull({ size = 32 }: LogoFullProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <LogoMark size={size} />
      <div>
        <div style={{ fontSize: size * 0.44, fontWeight: 800, letterSpacing: "-0.6px", color: "var(--c-text)", lineHeight: 1 }}>
          Nexora
        </div>
        <div style={{ fontSize: size * 0.28, fontFamily: "JetBrains Mono, monospace", color: "var(--c-dim)", letterSpacing: "0.12em", textTransform: "uppercase", lineHeight: 1.2 }}>
          Preorder
        </div>
      </div>
    </div>
  );
}
