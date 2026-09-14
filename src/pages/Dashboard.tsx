import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Boxes, Truck, ClipboardList, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight, MapPin } from "lucide-react";
import { revenueData, orders, warehouses, alertsData, topCustomers } from "@/data/data";
import { useNotification } from "@/contexts/NotificationContext";

const shipmentTrend = [
  { h: "06:00", v: 14 }, { h: "08:00", v: 38 }, { h: "10:00", v: 62 },
  { h: "12:00", v: 47 }, { h: "14:00", v: 71 }, { h: "16:00", v: 89 },
  { h: "18:00", v: 55 }, { h: "20:00", v: 28 },
];

const kpis = [
  { label: "Revenue (Today)",  value: "$418,200", delta: "+12.4%", up: true,  sub: "vs. yesterday",      icon: TrendingUp,  color: "accent" },
  { label: "Open Orders",      value: "1,284",    delta: "+38",    up: true,  sub: "since midnight",     icon: ClipboardList, color: "cyan" },
  { label: "Units Shipped",    value: "8,941",    delta: "+6.8%",  up: true,  sub: "vs. 7-day avg",      icon: Truck,       color: "green" },
  { label: "Inventory Value",  value: "$6.2M",    delta: "-1.2%",  up: false, sub: "all warehouses",     icon: Boxes,       color: "purple" },
  { label: "Low-Stock SKUs",   value: "47",       delta: "+11",    up: false, sub: "below reorder pt.",  icon: AlertTriangle, color: "amber" },
  { label: "On-Time Delivery", value: "96.3%",    delta: "+0.8%",  up: true,  sub: "30-day rolling",    icon: CheckCircle2, color: "green" },
];

const colorVar: Record<string, string> = {
  accent: "var(--c-accent)", cyan: "var(--c-cyan)", green: "var(--c-green)",
  purple: "var(--c-purple)", amber: "var(--c-amber)", red: "var(--c-red)",
};
const bgVar: Record<string, string> = {
  accent: "var(--c-accent-bg)", cyan: "var(--c-cyan-bg)", green: "var(--c-green-bg)",
  purple: "var(--c-purple-bg)", amber: "var(--c-amber-bg)", red: "var(--c-red-bg)",
};

const statusColor: Record<string, string> = {
  PROCESSING: "var(--c-accent)", PACKED: "var(--c-cyan)", SHIPPED: "var(--c-green)",
  DELIVERED: "var(--c-green)", HOLD: "var(--c-amber)",
};

function fmtK(n: number) { return n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`; }

function capBar(v: number) {
  const c = v > 85 ? "var(--c-red)" : v > 60 ? "var(--c-amber)" : "var(--c-green)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--c-surface3)" }}>
        <div style={{ height: 5, borderRadius: 3, width: `${v}%`, background: c }} />
      </div>
      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: c, width: 30, textAlign: "right" }}>{v}%</span>
    </div>
  );
}

export default function Dashboard() {
  const { success, warning } = useNotification();

  return (
    <div className="p-4 md:p-5 flex flex-col gap-4 overflow-x-hidden">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-[var(--c-text)] m-0">Operations Dashboard</h1>
          <p className="text-[11.5px] text-[var(--c-muted)] mt-1 font-mono">All regions · Real-time · Sep 10, 2026</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => warning("Report generating", "CSV export will be ready in ~30s.")} className="py-1.5 px-3 md:px-3.5 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-xs cursor-pointer text-[var(--c-muted)] hover:bg-[var(--c-surface2)] transition-colors">Export</button>
          <button onClick={() => success("Data refreshed", "Dashboard data is up to date.")} className="py-1.5 px-3 md:px-3.5 rounded-lg bg-[var(--c-accent)] text-white text-xs font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity">Refresh</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k) => {
          const Icon = k.icon;
          const col = colorVar[k.color];
          const bg  = bgVar[k.color];
          return (
            <div key={k.label} className="bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl p-4 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="p-1.5 rounded-lg" style={{ background: bg }}>
                  <Icon size={14} color={col} />
                </div>
                <span className="text-[11px] font-mono flex items-center gap-0.5" style={{ color: k.up ? "var(--c-green)" : "var(--c-red)" }}>
                  {k.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{k.delta}
                </span>
              </div>
              <div className="font-mono text-xl md:text-2xl font-semibold text-[var(--c-text)] leading-none">{k.value}</div>
              <div className="text-[11px] text-[var(--c-muted)] mt-1.5">{k.label}</div>
              <div className="text-[10px] text-[var(--c-dim)] mt-0.5 font-mono truncate">{k.sub}</div>
            </div>
          );
        })}
      </div>

      {/* charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl p-4">
          <p className="text-[10.5px] font-mono text-[var(--c-muted)] tracking-[0.1em] uppercase m-0 mb-3.5">Revenue · 10-day trend</p>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--c-accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--c-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" tick={{ fontSize: 9, fill: "var(--c-dim)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "var(--c-dim)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={36} />
              <Tooltip contentStyle={{ background: "var(--c-surface3)", border: "1px solid var(--c-border)", borderRadius: 8, fontSize: 11, fontFamily: "JetBrains Mono" }} labelStyle={{ color: "var(--c-muted)" }} itemStyle={{ color: "var(--c-accent)" }} formatter={(v: any) => [`$${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="v" stroke="var(--c-accent)" strokeWidth={2} fill="url(#rg)" dot={false} activeDot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl p-4">
          <p className="text-[10.5px] font-mono text-[var(--c-muted)] tracking-[0.1em] uppercase m-0 mb-3.5">Shipment throughput · today</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={shipmentTrend} barSize={14}>
              <XAxis dataKey="h" tick={{ fontSize: 9, fill: "var(--c-dim)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "var(--c-dim)", fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={22} />
              <Tooltip contentStyle={{ background: "var(--c-surface3)", border: "1px solid var(--c-border)", borderRadius: 8, fontSize: 11, fontFamily: "JetBrains Mono" }} itemStyle={{ color: "var(--c-cyan)" }} formatter={(v: any) => [v, "Shipments"]} />
              <Bar dataKey="v" radius={[3,3,0,0]}>
                {shipmentTrend.map((_, i) => <Cell key={i} fill={i === 5 ? "var(--c-cyan)" : "var(--c-surface3)"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* orders + top customers */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* recent orders */}
        <div className="lg:col-span-3 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl overflow-hidden flex flex-col">
          <div className="p-3.5 md:p-4 border-b border-[var(--c-border2)] flex items-center justify-between">
            <p className="text-[10.5px] font-mono text-[var(--c-muted)] tracking-[0.1em] uppercase m-0">Recent Orders</p>
          </div>
          <div className="overflow-x-auto">
            <div className="overflow-x-auto">
<table className="w-full text-xs border-collapse min-w-[400px]">
              <thead>
                <tr className="border-b border-[var(--c-border2)]">
                  {["Order", "Customer", "Value", "Status"].map((h) => (
                    <th key={h} className="p-2 md:p-3 text-left font-mono text-[9.5px] text-[var(--c-dim)] uppercase tracking-[0.08em] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-b border-[var(--c-border2)] hover:bg-[var(--c-surface2)] transition-colors">
                    <td className="p-2 md:p-3 font-mono text-[11.5px] text-[var(--c-accent)]">{o.id}</td>
                    <td className="p-2 md:p-3 text-[var(--c-text)] max-w-[120px] md:max-w-[160px] truncate">{o.customer}</td>
                    <td className="p-2 md:p-3 font-mono text-[var(--c-text)]">${o.value.toLocaleString()}</td>
                    <td className="p-2 md:p-3">
                      <span className="inline-flex items-center gap-1 py-0.5 px-2 rounded-md text-[10px] font-mono font-medium" style={{ background: `${statusColor[o.status]}18`, color: statusColor[o.status] }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
</div>
          </div>
        </div>

        {/* top customers */}
        <div className="lg:col-span-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl p-4">
          <p className="text-[10.5px] font-mono text-[var(--c-muted)] tracking-[0.1em] uppercase m-0 mb-3.5">Top Customers · MTD</p>
          <div className="flex flex-col gap-3">
            {topCustomers.map((c, i) => (
              <div key={c.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-[var(--c-text)] truncate max-w-[140px] md:max-w-[180px]">{c.name}</span>
                  <span className="font-mono text-xs text-[var(--c-text)] shrink-0">${(c.revenue / 1000).toFixed(0)}k</span>
                </div>
                <div className="h-1 rounded-full bg-[var(--c-surface3)]">
                  <div className="h-1 rounded-full" style={{ background: i === 0 ? "var(--c-accent)" : i === 1 ? "var(--c-cyan)" : "var(--c-purple)", width: `${(c.revenue / topCustomers[0].revenue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* warehouse + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl p-4">
          <p className="text-[10.5px] font-mono text-[var(--c-muted)] tracking-[0.1em] uppercase m-0 mb-3.5">Warehouse Status</p>
          <div className="flex flex-col gap-2">
            {warehouses.map((wh) => (
              <div key={wh.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-[var(--c-surface2)] border border-[var(--c-border2)]">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-mono text-[10px] text-[var(--c-dim)] w-10 sm:w-11">{wh.id}</span>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${wh.active ? 'bg-[var(--c-green)] pulse-dot' : 'bg-[var(--c-dim)]'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[var(--c-text)] truncate">{wh.name}</div>
                    <div className="text-[10px] text-[var(--c-dim)] flex items-center gap-1">
                      <MapPin size={8} /> <span className="truncate">{wh.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                  <div className="w-full sm:w-[120px] lg:w-[140px] shrink-0">{capBar(wh.capacity)}</div>
                  {wh.alerts > 0 && (
                    <span className="text-[10px] text-[var(--c-amber)] flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
                      <AlertTriangle size={10} />{wh.alerts}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl p-4 flex flex-col">
          <p className="text-[10.5px] font-mono text-[var(--c-muted)] tracking-[0.1em] uppercase m-0 mb-3.5">Live Alerts</p>
          <div className="flex flex-col gap-2 flex-1">
            {alertsData.filter((a) => !a.read).slice(0, 5).map((a) => (
              <div key={a.id} className="p-2.5 rounded-lg" style={{ borderLeft: `3px solid ${a.type === "critical" ? "var(--c-red)" : a.type === "warning" ? "var(--c-amber)" : "var(--c-border)"}`, background: a.type === "critical" ? "var(--c-red-bg)" : a.type === "warning" ? "var(--c-amber-bg)" : "var(--c-surface2)" }}>
                <p className="text-[11.5px] text-[var(--c-text)] m-0 mb-1 leading-snug">{a.msg}</p>
                <p className="text-[10px] font-mono text-[var(--c-dim)] m-0">{a.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
