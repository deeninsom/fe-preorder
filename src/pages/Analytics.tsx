import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { revenueData, topCustomers, orders } from "@/data/data";

const RANGES = ["1W", "1M", "3M", "1Y"];

const monthlyOrders = [
  { m: "Apr", orders: 892, revenue: 2100000 },
  { m: "May", orders: 1021, revenue: 2480000 },
  { m: "Jun", orders: 978, revenue: 2290000 },
  { m: "Jul", orders: 1180, revenue: 2810000 },
  { m: "Aug", orders: 1094, revenue: 2640000 },
  { m: "Sep", orders: 1284, revenue: 3120000 },
];

const fulfillmentData = [
  { name: "On Time", value: 963, color: "var(--c-green)" },
  { name: "Late", value: 28, color: "var(--c-amber)" },
  { name: "Failed", value: 9, color: "var(--c-red)" },
];

const categoryRevenue = [
  { cat: "Electronics", v: 1240000 },
  { cat: "Industrial",  v: 890000 },
  { cat: "FMCG",        v: 1680000 },
  { cat: "Apparel",     v: 420000 },
  { cat: "Hardware",    v: 310000 },
  { cat: "Chemicals",   v: 580000 },
];

const catColors = ["var(--c-accent)", "var(--c-cyan)", "var(--c-green)", "var(--c-purple)", "var(--c-amber)", "var(--c-red)"];

function fmtK(n: number) { return `$${(n / 1000).toFixed(0)}k`; }
function fmtM(n: number) { return n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : fmtK(n); }

const TooltipStyle = { background: "var(--c-surface3)", border: "1px solid var(--c-border)", borderRadius: 8, fontSize: 11, fontFamily: "JetBrains Mono" };

export default function Analytics() {
  const [range, setRange] = useState("1M");

  return (
    <div className="p-4 md:p-5 flex flex-col gap-4 overflow-x-hidden">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--c-text)", margin: 0, letterSpacing: "-0.5px" }}>Analytics</h1>
          <p style={{ fontSize: 11.5, color: "var(--c-muted)", margin: "3px 0 0", fontFamily: "JetBrains Mono, monospace" }}>Performance metrics · Meridian Group</p>
        </div>
        <div style={{ display: "flex", gap: 4, background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 9, padding: 4 }}>
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)} style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, background: range === r ? "var(--c-accent)" : "transparent", color: range === r ? "#fff" : "var(--c-muted)" }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* top KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total Revenue",    value: "$3.12M", sub: "Sep MTD", color: "var(--c-accent)" },
          { label: "Orders Processed", value: "1,284",  sub: "Sep MTD", color: "var(--c-cyan)" },
          { label: "Avg. Order Value", value: "$2,431", sub: "Sep MTD", color: "var(--c-purple)" },
          { label: "Fulfillment Rate", value: "96.3%",  sub: "30d avg", color: "var(--c-green)" },
        ].map((k) => (
          <div key={k.label} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 18 }}>
            <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 26, fontWeight: 700, color: k.color, lineHeight: 1, marginBottom: 6 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "var(--c-muted)" }}>{k.label}</div>
            <div style={{ fontSize: 10.5, color: "var(--c-dim)", fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* revenue trend + fulfillment */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 18 }}>
          <p style={{ fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>Revenue & Order Volume</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyOrders}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--c-accent)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--c-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{ fontSize: 9, fill: "var(--c-dim)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rev" tick={{ fontSize: 9, fill: "var(--c-dim)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={fmtM} width={44} />
              <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 9, fill: "var(--c-dim)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={TooltipStyle} formatter={(v: any, name: any) => [name === "revenue" ? fmtM(v) : v, name === "revenue" ? "Revenue" : "Orders"]} />
              <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="var(--c-accent)" strokeWidth={2} fill="url(#ag)" dot={false} />
              <Line yAxisId="ord" type="monotone" dataKey="orders" stroke="var(--c-cyan)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 18 }}>
          <p style={{ fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>Fulfillment Breakdown</p>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={fulfillmentData} dataKey="value" cx="50%" cy="50%" innerRadius={36} outerRadius={54} paddingAngle={3}>
                {fulfillmentData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={TooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {fulfillmentData.map((d) => (
              <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  <span style={{ fontSize: 11.5, color: "var(--c-muted)" }}>{d.name}</span>
                </div>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--c-text)", fontWeight: 600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* category revenue + top customers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 18 }}>
          <p style={{ fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>Revenue by Category</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={categoryRevenue} layout="vertical" barSize={12}>
              <XAxis type="number" tick={{ fontSize: 9, fill: "var(--c-dim)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
              <YAxis dataKey="cat" type="category" tick={{ fontSize: 10, fill: "var(--c-muted)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={TooltipStyle} formatter={(v: any) => [fmtM(v), "Revenue"]} />
              <Bar dataKey="v" radius={[0, 4, 4, 0]}>
                {categoryRevenue.map((_, i) => <Cell key={i} fill={catColors[i % catColors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 18 }}>
          <p style={{ fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>Top Customers · MTD</p>
          <div className="overflow-x-auto">
<table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--c-border2)" }}>
                {["Customer", "Orders", "Revenue"].map((h) => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontSize: 9.5, color: "var(--c-dim)", fontFamily: "JetBrains Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c, i) => (
                <tr key={c.name} style={{ borderBottom: "1px solid var(--c-border2)" }}>
                  <td style={{ padding: "8px 8px", color: "var(--c-text)", maxWidth: 180, overflow: "hidden", overflowX: "auto", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "var(--c-dim)", marginRight: 6 }}>#{i + 1}</span>
                    {c.name}
                  </td>
                  <td style={{ padding: "8px 8px", fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)" }}>{c.orders}</td>
                  <td style={{ padding: "8px 8px", fontFamily: "JetBrains Mono, monospace", color: "var(--c-text)", fontWeight: 600 }}>${(c.revenue / 1000).toFixed(0)}k</td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        </div>
      </div>

      {/* daily revenue sparklines */}
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 18 }}>
        <p style={{ fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>Daily Revenue · Last 10 days</p>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--c-purple)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--c-purple)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="d" tick={{ fontSize: 9, fill: "var(--c-dim)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "var(--c-dim)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={36} />
            <Tooltip contentStyle={TooltipStyle} formatter={(v: any) => [`$${v.toLocaleString()}`, "Revenue"]} />
            <Area type="monotone" dataKey="v" stroke="var(--c-purple)" strokeWidth={2} fill="url(#dg)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
