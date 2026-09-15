import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { tenants } from "@/data/data";
import { Crown, TrendingUp, Users, DollarSign, AlertTriangle, CheckCircle2, Clock, X } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";

const mrrHistory = [
  { m: "Apr", mrr: 16800 }, { m: "May", mrr: 19200 }, { m: "Jun", mrr: 21400 },
  { m: "Jul", mrr: 23100 }, { m: "Aug", mrr: 24900 }, { m: "Sep", mrr: 26800 },
];

const planCfg: Record<string, { color: string; bg: string }> = {
  Enterprise: { color: "var(--c-purple)", bg: "var(--c-purple-bg)" },
  Pro:        { color: "var(--c-accent)", bg: "var(--c-accent-bg)" },
  Starter:    { color: "var(--c-cyan)",   bg: "var(--c-cyan-bg)" },
};

const statusCfg: Record<string, { color: string; icon: React.ReactNode }> = {
  active:  { color: "var(--c-green)", icon: <CheckCircle2 size={11} /> },
  trial:   { color: "var(--c-amber)", icon: <Clock size={11} /> },
  churned: { color: "var(--c-red)",   icon: <X size={11} /> },
};

export default function OwnerAdmin() {
  const [selectedTenant, setSelectedTenant] = useState<typeof tenants[0] | null>(null);
  const { success, warning, info } = useNotification();

  const totalMrr = tenants.filter((t) => t.status === "active").reduce((s, t) => s + t.mrr, 0);
  const totalUsers = tenants.reduce((s, t) => s + t.users, 0);
  const churnCount = tenants.filter((t) => t.status === "churned").length;
  const trialCount = tenants.filter((t) => t.status === "trial").length;

  return (
    <div className="p-4 md:p-5 flex flex-col gap-4 overflow-x-hidden">
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 14, background: "linear-gradient(135deg, var(--c-purple-bg) 0%, var(--c-accent-bg) 100%)", border: "1px solid var(--c-border)" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--c-purple)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Crown size={18} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--c-text)", margin: 0, letterSpacing: "-0.5px" }}>Owner Admin · DistroOS Platform</h1>
          <p style={{ fontSize: 11.5, color: "var(--c-muted)", margin: "2px 0 0", fontFamily: "JetBrains Mono, monospace" }}>SaaS management console · {tenants.length} tenants</p>
        </div>
      </div>

      {/* top KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {[
          { label: "MRR",            value: `$${totalMrr.toLocaleString()}`,         sub: "active tenants",   color: "var(--c-green)" },
          { label: "ARR",            value: `$${(totalMrr * 12).toLocaleString()}`,  sub: "annualized",       color: "var(--c-green)" },
          { label: "Total Users",    value: String(totalUsers),                       sub: "all orgs",         color: "var(--c-accent)" },
          { label: "Trial",          value: String(trialCount),                       sub: "converting",       color: "var(--c-amber)" },
          { label: "Churned",        value: String(churnCount),                       sub: "last 90 days",     color: "var(--c-red)" },
        ].map((k) => (
          <div key={k.label} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 24, fontWeight: 700, color: k.color, lineHeight: 1, marginBottom: 6 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "var(--c-muted)" }}>{k.label}</div>
            <div style={{ fontSize: 10, color: "var(--c-dim)", fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* MRR chart + plan breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 18 }}>
          <p style={{ fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>MRR Growth</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={mrrHistory}>
              <defs>
                <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--c-green)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--c-green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{ fontSize: 9, fill: "var(--c-dim)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "var(--c-dim)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={36} />
              <Tooltip contentStyle={{ background: "var(--c-surface3)", border: "1px solid var(--c-border)", borderRadius: 8, fontSize: 11, fontFamily: "JetBrains Mono" }} formatter={(v: any) => [`$${v.toLocaleString()}`, "MRR"]} />
              <Area type="monotone" dataKey="mrr" stroke="var(--c-green)" strokeWidth={2} fill="url(#mg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 18 }}>
          <p style={{ fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>Plan Preorder</p>
          {[
            { plan: "Enterprise", count: tenants.filter((t) => t.plan === "Enterprise").length, mrr: tenants.filter((t) => t.plan === "Enterprise" && t.status === "active").reduce((s, t) => s + t.mrr, 0) },
            { plan: "Pro",        count: tenants.filter((t) => t.plan === "Pro").length,        mrr: tenants.filter((t) => t.plan === "Pro" && t.status === "active").reduce((s, t) => s + t.mrr, 0) },
            { plan: "Starter",    count: tenants.filter((t) => t.plan === "Starter").length,    mrr: tenants.filter((t) => t.plan === "Starter" && t.status === "active").reduce((s, t) => s + t.mrr, 0) },
          ].map((p) => {
            const c = planCfg[p.plan];
            return (
              <div key={p.plan} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--c-border2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontFamily: "JetBrains Mono, monospace", fontWeight: 600, background: c.bg, color: c.color }}>{p.plan}</span>
                  <span style={{ fontSize: 11.5, color: "var(--c-muted)" }}>{p.count} orgs</span>
                </div>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--c-text)", fontWeight: 600 }}>${p.mrr.toLocaleString()}/mo</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* tenants table */}
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, overflow: "hidden", overflowX: "auto" }}>
        <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid var(--c-border2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>All Tenants</p>
          <button onClick={() => info("Export", "Tenant CSV downloading…")} style={{ fontSize: 12, color: "var(--c-accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Export CSV</button>
        </div>
        <div className="overflow-x-auto">
<table style={{ width: "100%", fontSize: 12.5, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--c-border2)" }}>
              {["Org ID", "Company", "Plan", "MRR", "Users", "Orders", "Storage", "Status", "Joined", ""].map((h) => (
                <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 9.5, color: "var(--c-dim)", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => {
              const sc = statusCfg[t.status];
              const pc = planCfg[t.plan];
              return (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTenant(t)}
                  style={{ borderBottom: "1px solid var(--c-border2)", cursor: "pointer", background: selectedTenant?.id === t.id ? "var(--c-accent-bg)" : "transparent" }}
                >
                  <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--c-dim)" }}>{t.id}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--c-text)" }}>{t.name}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", background: pc.bg, color: pc.color, fontWeight: 600 }}>{t.plan}</span>
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", color: t.status === "churned" ? "var(--c-dim)" : "var(--c-green)", fontWeight: 600 }}>
                    {t.status === "churned" ? "—" : `$${t.mrr.toLocaleString()}`}
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)" }}>{t.users}</td>
                  <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)" }}>{t.orders}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--c-surface3)", minWidth: 60 }}>
                        <div style={{ height: 4, borderRadius: 2, background: t.storage > 80 ? "var(--c-red)" : "var(--c-accent)", width: `${t.storage}%` }} />
                      </div>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "var(--c-dim)", width: 28 }}>{t.storage}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: sc.color, textTransform: "capitalize" }}>
                      {sc.icon} {t.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--c-dim)" }}>{t.joined}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); info("Impersonating", `Switching to ${t.name} context…`); }}
                      style={{ fontSize: 11, color: "var(--c-accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                    >
                      Impersonate
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
</div>
      </div>

      {/* tenant detail panel */}
      {selectedTenant && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 380, background: "var(--c-surface)", borderLeft: "1px solid var(--c-border)", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", zIndex: 100, overflowY: "auto", padding: 24 }} className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--c-dim)" }}>{selectedTenant.id}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--c-text)", marginTop: 3 }}>{selectedTenant.name}</div>
            </div>
            <button onClick={() => setSelectedTenant(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-dim)", display: "flex" }}><X size={18} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Plan", selectedTenant.plan],
              ["Status", selectedTenant.status],
              ["MRR", selectedTenant.status === "churned" ? "—" : `$${selectedTenant.mrr.toLocaleString()}/mo`],
              ["ARR", selectedTenant.status === "churned" ? "—" : `$${(selectedTenant.mrr * 12).toLocaleString()}/yr`],
              ["Active Users", String(selectedTenant.users)],
              ["Total Orders", String(selectedTenant.orders)],
              ["Storage", `${selectedTenant.storage}%`],
              ["Joined", selectedTenant.joined],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--c-border2)" }}>
                <span style={{ fontSize: 12, color: "var(--c-dim)" }}>{k}</span>
                <span style={{ fontSize: 12.5, color: "var(--c-text)", fontWeight: 500, fontFamily: "JetBrains Mono, monospace" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <button onClick={() => { success("Plan updated", `${selectedTenant.name} upgraded to Enterprise.`); setSelectedTenant(null); }} style={{ padding: "9px", borderRadius: 8, background: "var(--c-purple)", color: "#fff", fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer" }}>Upgrade to Enterprise</button>
              <button onClick={() => { warning("Invoice sent", `Billing email sent to ${selectedTenant.name}.`); }} style={{ padding: "9px", borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 12.5, cursor: "pointer" }}>Send Invoice</button>
              <button onClick={() => { info("Support ticket", `Opened session for ${selectedTenant.name}.`); setSelectedTenant(null); }} style={{ padding: "9px", borderRadius: 8, border: "1px solid var(--c-accent)", color: "var(--c-accent)", background: "transparent", fontSize: 12.5, cursor: "pointer" }}>Impersonate Tenant</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
