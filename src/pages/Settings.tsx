import { useState } from "react";
import {
  User, Building2, Users, Bell, CreditCard,
  Plus, Pencil, Trash2, Check, X, Shield, Globe, Clock,
  ChevronRight, Upload, Mail, Lock, Eye, EyeOff,
} from "lucide-react";
import { useAuth } from "@/features/Auth/hooks/useAuth";
import { useNotification } from "@/contexts/NotificationContext";
import { LogoMark } from "@/components/ui/Logo";

type Tab = "profile" | "organization" | "team" | "notifications" | "billing";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Viewer";
  status: "active" | "pending";
  joined: string;
}

const initialTeam: TeamMember[] = [
  { id: "t1", name: "Sarah Chen", email: "admin@meridian.com", role: "Admin", status: "active", joined: "Jan 2025" },
  { id: "t2", name: "Marcus Webb", email: "m.webb@meridian.com", role: "Manager", status: "active", joined: "Feb 2025" },
  { id: "t3", name: "Priya Nair", email: "p.nair@meridian.com", role: "Manager", status: "active", joined: "Mar 2025" },
  { id: "t4", name: "Jordan Lee", email: "j.lee@meridian.com", role: "Viewer", status: "active", joined: "Apr 2025" },
  { id: "t5", name: "Tomas Ruiz", email: "t.ruiz@meridian.com", role: "Viewer", status: "pending", joined: "Sep 2026" },
];

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "team", label: "Team", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing & Plan", icon: CreditCard },
];

const ROLES: TeamMember["role"][] = ["Admin", "Manager", "Viewer"];

const roleColor: Record<string, string> = {
  Admin: "var(--c-purple)",
  Manager: "var(--c-accent)",
  Viewer: "var(--c-muted)",
};
const roleBg: Record<string, string> = {
  Admin: "var(--c-purple-bg)",
  Manager: "var(--c-accent-bg)",
  Viewer: "var(--c-surface3)",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--c-text)", margin: "0 0 4px", letterSpacing: "-0.3px" }}>{children}</h2>;
}
function SectionDesc({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12.5, color: "var(--c-muted)", margin: "0 0 24px" }}>{children}</p>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: 12, fontWeight: 500, color: "var(--c-muted)", display: "block", marginBottom: 5 }}>{children}</label>;
}
function TextInput({ value, onChange, type = "text", placeholder, readOnly }: { value: string; onChange?: (v: string) => void; type?: string; placeholder?: string; readOnly?: boolean }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: readOnly ? "var(--c-surface2)" : "var(--c-surface)", color: "var(--c-text)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
    />
  );
}
function Row({ children, cols = "1fr 1fr" }: { children: React.ReactNode; cols?: string }) {
  return <div style={{ display: "grid", gridTemplateColumns: cols, gap: 16, marginBottom: 16 }}>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label>{children}</div>;
}
function Divider() {
  return <div style={{ height: 1, background: "var(--c-border2)", margin: "28px 0" }} />;
}
function SaveBtn({ onClick, label = "Save changes" }: { onClick: () => void; label?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
      <button onClick={onClick} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--c-accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
        {label}
      </button>
    </div>
  );
}

/* ── Tabs ─────────────────────────────────────────────────────────────── */

function ProfileTab() {
  const { user } = useAuth();
  const { success } = useNotification();
  const [name, setName] = useState(user?.name ?? "");
  const [email] = useState(user?.email ?? "");
  // const [showPw, setShowPw] = useState(false);
  const [phone, setPhone] = useState(user?.phone ?? "");
  // const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  const saveProfile = () => success("Profile updated", "Your profile details have been saved.");

  // const savePassword = () => {
  //   if (!pw.current) return;
  //   if (pw.next !== pw.confirm) return;
  //   success("Password changed", "Your password has been updated successfully.");
  //   setPw({ current: "", next: "", confirm: "" });
  // };

  return (
    <div>
      <SectionTitle>Profile</SectionTitle>
      <SectionDesc>Manage your personal information and account credentials.</SectionDesc>

      {/* avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, var(--c-accent), var(--c-cyan))", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <User size={26} color="#fff" />
        </div>
        {/* <div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface2)", fontSize: 12.5, cursor: "pointer", color: "var(--c-muted)" }}>
            <Upload size={13} /> Upload photo
          </button>
          <p style={{ fontSize: 11, color: "var(--c-dim)", marginTop: 5 }}>JPG, PNG up to 2 MB</p>
        </div> */}
      </div>

      <Row>
        <Field label="Full name">
          <TextInput value={name} onChange={setName} placeholder="Your full name" />
        </Field>
        <Field label="Email address">
          <TextInput value={email} readOnly />
        </Field>
      </Row>
      <Row cols="1fr 1fr">
        {/* TODO: Add job title field */}
        {/* <Field label="Job title">
          <TextInput value="Operations Administrator" placeholder="Job title" />
        </Field> */}
        <Field label="Phone number">
          <TextInput value={phone} onChange={setPhone} placeholder="+1 (555) 000-0000" />
        </Field>
      </Row>
      <SaveBtn onClick={saveProfile} />

      <Divider />

      {/* TODO: Add change password section */}
      {/* <SectionTitle>Change password</SectionTitle>
      <SectionDesc>Use a strong password with at least 8 characters.</SectionDesc>

      <div style={{ maxWidth: 420, display: "flex", flexDirection: "column", gap: 14 }}>
        {([["Current password", "current"], ["New password", "next"], ["Confirm new password", "confirm"]] as const).map(([label, key]) => (
          <Field key={key} label={label}>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={pw[key]}
                onChange={(e) => setPw((p) => ({ ...p, [key]: e.target.value }))}
                placeholder="••••••••"
                style={{ width: "100%", padding: "9px 40px 9px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text)", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
              <button onClick={() => setShowPw((v) => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--c-dim)" }}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={savePassword} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--c-accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
            Update password
          </button>
        </div>
      </div> 
      
      <Divider />
      */}


      <SectionTitle>Danger zone</SectionTitle>
      <SectionDesc>Permanently delete your account and all associated data.</SectionDesc>
      <button style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid var(--c-red)", background: "transparent", color: "var(--c-red)", fontSize: 13, cursor: "pointer" }}>
        Delete account
      </button>
    </div>
  );
}

function OrganizationTab() {
  const { success } = useNotification();
  const [org, setOrg] = useState({
    name: "Meridian Group",
    domain: "meridian.com",
    address: "400 Corporate Drive, Newark NJ 07102",
    timezone: "America/New_York",
    currency: "USD",
    language: "English (US)",
    industry: "B2B Preorder",
    size: "201–500",
  });

  return (
    <div>
      <SectionTitle>Organization</SectionTitle>
      <SectionDesc>Configure your organization identity and regional settings.</SectionDesc>

      {/* logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, padding: 18, borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-surface2)" }}>
        <LogoMark size={48} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text)", marginBottom: 4 }}>{org.name}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 7, border: "1px solid var(--c-border)", background: "var(--c-surface)", fontSize: 12, cursor: "pointer", color: "var(--c-muted)" }}>
              <Upload size={12} /> Upload logo
            </button>
            <button style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--c-border)", background: "transparent", fontSize: 12, cursor: "pointer", color: "var(--c-red)" }}>
              Remove
            </button>
          </div>
        </div>
      </div>

      <Row>
        <Field label="Organization name">
          <TextInput value={org.name} onChange={(v) => setOrg((o) => ({ ...o, name: v }))} />
        </Field>
        <Field label="Primary domain">
          <TextInput value={org.domain} onChange={(v) => setOrg((o) => ({ ...o, domain: v }))} placeholder="company.com" />
        </Field>
      </Row>
      <div style={{ marginBottom: 16 }}>
        <Field label="Billing address">
          <TextInput value={org.address} onChange={(v) => setOrg((o) => ({ ...o, address: v }))} />
        </Field>
      </div>
      <Row>
        <Field label="Timezone">
          <select value={org.timezone} onChange={(e) => setOrg((o) => ({ ...o, timezone: e.target.value }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text)", fontSize: 13, outline: "none" }}>
            {["America/New_York", "America/Chicago", "America/Los_Angeles", "Europe/London", "Asia/Singapore"].map((tz) => <option key={tz}>{tz}</option>)}
          </select>
        </Field>
        <Field label="Currency">
          <select value={org.currency} onChange={(e) => setOrg((o) => ({ ...o, currency: e.target.value }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text)", fontSize: 13, outline: "none" }}>
            {["USD", "EUR", "GBP", "SGD", "AUD"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </Row>
      <Row>
        <Field label="Industry">
          <TextInput value={org.industry} onChange={(v) => setOrg((o) => ({ ...o, industry: v }))} />
        </Field>
        <Field label="Company size">
          <select value={org.size} onChange={(e) => setOrg((o) => ({ ...o, size: e.target.value }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text)", fontSize: 13, outline: "none" }}>
            {["1–10", "11–50", "51–200", "201–500", "500+"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </Row>
      <SaveBtn onClick={() => success("Organization saved", "Your organization details have been updated.")} />
    </div>
  );
}

function TeamTab() {
  const { success, error, info } = useNotification();
  const [members, setMembers] = useState<TeamMember[]>(initialTeam);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "Viewer" as TeamMember["role"] });

  const handleAdd = () => {
    if (!newMember.name || !newMember.email) return;
    const m: TeamMember = {
      id: `t${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: "pending",
      joined: "Sep 2026",
    };
    setMembers((prev) => [...prev, m]);
    setNewMember({ name: "", email: "", role: "Viewer" });
    setShowAdd(false);
    success("Invitation sent", `${newMember.email} has been invited to join.`);
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    setMembers((prev) => prev.map((m) => (m.id === editing.id ? editing : m)));
    setEditing(null);
    success("Member updated", `${editing.name} has been updated.`);
  };

  const handleDelete = (id: string) => {
    const m = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirm(null);
    info("Member removed", `${m?.name} has been removed from the team.`);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <SectionTitle>Team Members</SectionTitle>
          <SectionDesc>{members.length} members · manage access and roles</SectionDesc>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--c-accent)", color: "#fff", fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer" }}>
          <Plus size={13} /> Invite member
        </button>
      </div>

      {/* add form */}
      {showAdd && (
        <div className="p-4 md:p-5 fade-in" style={{ borderRadius: 12, border: "1px solid var(--c-accent)", background: "var(--c-accent-bg)", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 14 }}>Invite new member</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 12, alignItems: "end" }}>
            <Field label="Full name">
              <TextInput value={newMember.name} onChange={(v) => setNewMember((p) => ({ ...p, name: v }))} placeholder="Jane Smith" />
            </Field>
            <Field label="Email">
              <TextInput value={newMember.email} onChange={(v) => setNewMember((p) => ({ ...p, email: v }))} placeholder="jane@company.com" type="email" />
            </Field>
            <Field label="Role">
              <select value={newMember.role} onChange={(e) => setNewMember((p) => ({ ...p, role: e.target.value as TeamMember["role"] }))} style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text)", fontSize: 13, outline: "none" }}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleAdd} style={{ padding: "9px 14px", borderRadius: 8, background: "var(--c-accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Send invite</button>
              <button onClick={() => setShowAdd(false)} style={{ padding: "9px", borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center" }}><X size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {/* role legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {ROLES.map((r) => (
          <div key={r} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--c-muted)" }}>
            <span style={{ padding: "2px 7px", borderRadius: 5, fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", background: roleBg[r], color: roleColor[r] }}>{r}</span>
            {r === "Admin" ? "Full access" : r === "Manager" ? "Can edit" : "Read only"}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {members.map((m) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)" }}>
            {/* avatar */}
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${roleColor[m.role]}, var(--c-cyan))`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{m.name.charAt(0)}</span>
            </div>

            {editing?.id === m.id ? (
              /* edit row */
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 10, alignItems: "center" }}>
                <input value={editing.name} onChange={(e) => setEditing((p) => p ? { ...p, name: e.target.value } : p)} style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid var(--c-accent)", background: "var(--c-surface2)", color: "var(--c-text)", fontSize: 12.5, outline: "none" }} />
                <select value={editing.role} onChange={(e) => setEditing((p) => p ? { ...p, role: e.target.value as TeamMember["role"] } : p)} style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid var(--c-border)", background: "var(--c-surface2)", color: "var(--c-text)", fontSize: 12.5, outline: "none" }}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
                <button onClick={handleSaveEdit} style={{ padding: "6px 12px", borderRadius: 7, background: "var(--c-green)", color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Check size={12} /> Save</button>
                <button onClick={() => setEditing(null)} style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center" }}><X size={12} /></button>
              </div>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)" }}>{m.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--c-muted)", marginTop: 1 }}>{m.email}</div>
                </div>
                <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 10.5, fontFamily: "JetBrains Mono, monospace", background: roleBg[m.role], color: roleColor[m.role] }}>{m.role}</span>
                <span style={{ fontSize: 11, color: m.status === "active" ? "var(--c-green)" : "var(--c-amber)", fontFamily: "JetBrains Mono, monospace", textTransform: "capitalize" }}>{m.status}</span>
                <span style={{ fontSize: 11, color: "var(--c-dim)", fontFamily: "JetBrains Mono, monospace" }}>{m.joined}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setEditing(m)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--c-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-muted)" }}><Pencil size={12} /></button>
                  <button onClick={() => setDeleteConfirm(m.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--c-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-red)" }}><Trash2 size={12} /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* delete confirm modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 16, padding: 28, maxWidth: 380, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} className="fade-in">
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", margin: "0 0 8px" }}>Remove member?</h3>
            <p style={{ fontSize: 13, color: "var(--c-muted)", margin: "0 0 24px" }}>
              {members.find((m) => m.id === deleteConfirm)?.name} will lose access immediately. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => handleDelete(deleteConfirm!)} style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--c-red)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Remove</button>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-muted)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationsTab() {
  const { success } = useNotification();
  const [prefs, setPrefs] = useState({
    email_order: true,
    email_inventory: true,
    email_shipment: false,
    email_alerts: true,
    push_order: false,
    push_inventory: true,
    push_shipment: true,
    push_alerts: true,
    digest: "daily",
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const groups = [
    {
      title: "Email notifications",
      items: [
        { key: "email_order" as const, label: "New orders", desc: "When a new order is created or updated" },
        { key: "email_inventory" as const, label: "Inventory alerts", desc: "Low stock and reorder point notifications" },
        { key: "email_shipment" as const, label: "Shipment updates", desc: "Carrier status changes and exceptions" },
        { key: "email_alerts" as const, label: "System alerts", desc: "Critical system and warehouse alerts" },
      ],
    },
    {
      title: "Push / in-app notifications",
      items: [
        { key: "push_order" as const, label: "Order events", desc: "Real-time order status changes" },
        { key: "push_inventory" as const, label: "Stock warnings", desc: "Immediate low-stock push alerts" },
        { key: "push_shipment" as const, label: "Tracking updates", desc: "Live carrier scan events" },
        { key: "push_alerts" as const, label: "Critical alerts", desc: "Warehouse and system emergencies" },
      ],
    },
  ];

  return (
    <div>
      <SectionTitle>Notifications</SectionTitle>
      <SectionDesc>Choose what you get notified about and how.</SectionDesc>

      {groups.map((g) => (
        <div key={g.title} style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 700, color: "var(--c-text)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}>{g.title}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {g.items.map((item) => (
              <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--c-text)" }}>{item.label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--c-muted)", marginTop: 2 }}>{item.desc}</div>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  style={{ width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer", position: "relative", background: prefs[item.key] ? "var(--c-accent)" : "var(--c-surface3)", transition: "background 0.2s", flexShrink: 0 }}
                >
                  <div style={{ position: "absolute", top: 3, left: prefs[item.key] ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Email digest frequency</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["none", "daily", "weekly"].map((opt) => (
            <button key={opt} onClick={() => setPrefs((p) => ({ ...p, digest: opt }))} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${prefs.digest === opt ? "var(--c-accent)" : "var(--c-border)"}`, background: prefs.digest === opt ? "var(--c-accent-bg)" : "var(--c-surface)", color: prefs.digest === opt ? "var(--c-accent)" : "var(--c-muted)", fontSize: 12.5, cursor: "pointer", textTransform: "capitalize" }}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <SaveBtn onClick={() => success("Preferences saved", "Your notification settings have been updated.")} />
    </div>
  );
}

function BillingTab() {
  const { success, info } = useNotification();
  return (
    <div>
      <SectionTitle>Billing & Plan</SectionTitle>
      <SectionDesc>Manage your subscription, invoices, and payment method.</SectionDesc>

      {/* current plan */}
      <div className="p-4 md:p-5" style={{ borderRadius: 14, border: "2px solid var(--c-accent)", background: "var(--c-accent-bg)", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "var(--c-accent)", letterSpacing: "0.1em", marginBottom: 6 }}>CURRENT PLAN</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--c-text)", letterSpacing: "-0.5px" }}>Enterprise</div>
            <div style={{ fontSize: 13, color: "var(--c-muted)", marginTop: 4 }}>$2,490 / month · billed annually</div>
          </div>
          <span style={{ padding: "4px 10px", borderRadius: 6, background: "var(--c-green-bg)", color: "var(--c-green)", fontSize: 11.5, fontWeight: 600, fontFamily: "JetBrains Mono, monospace" }}>Active</span>
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 18 }}>
          {[["Unlimited", "orders/month"], ["100 GB", "storage"], ["50", "team members"], ["5", "warehouses"]].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 16, fontWeight: 700, color: "var(--c-accent)" }}>{val}</div>
              <div style={{ fontSize: 11, color: "var(--c-muted)" }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* usage */}
      <div style={{ padding: 18, borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-surface)", marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Usage this month</div>
        {[
          { label: "Storage", used: 78, cap: 100, unit: "GB" },
          { label: "API calls", used: 84200, cap: 200000, unit: "" },
          { label: "Team members", used: 42, cap: 50, unit: "" },
        ].map((u) => (
          <div key={u.label} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, color: "var(--c-text)" }}>{u.label}</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--c-muted)" }}>{u.used.toLocaleString()}{u.unit} / {u.cap.toLocaleString()}{u.unit}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "var(--c-surface3)" }}>
              <div style={{ height: 6, borderRadius: 3, background: (u.used / u.cap) > 0.85 ? "var(--c-red)" : "var(--c-accent)", width: `${(u.used / u.cap) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* payment method */}
      <div style={{ padding: 18, borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-surface)", marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Payment method</div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 32, borderRadius: 6, background: "var(--c-surface3)", border: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={16} color="var(--c-muted)" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--c-text)" }}>Visa ending in 4892</div>
              <div style={{ fontSize: 11.5, color: "var(--c-muted)" }}>Expires 11/2027</div>
            </div>
          </div>
          <button onClick={() => info("Payment update", "Redirecting to billing portal…")} style={{ fontSize: 12.5, color: "var(--c-accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>Update</button>
        </div>
      </div>

      {/* invoices */}
      <div style={{ padding: 18, borderRadius: 12, border: "1px solid var(--c-border)", background: "var(--c-surface)" }}>
        <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Recent invoices</div>
        {[
          { date: "Sep 1, 2026", amount: "$2,490.00", status: "Paid" },
          { date: "Aug 1, 2026", amount: "$2,490.00", status: "Paid" },
          { date: "Jul 1, 2026", amount: "$2,490.00", status: "Paid" },
        ].map((inv) => (
          <div key={inv.date} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--c-border2)" }}>
            <div style={{ fontSize: 13, color: "var(--c-text)" }}>{inv.date}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--c-text)", fontWeight: 600 }}>{inv.amount}</span>
              <span style={{ fontSize: 11.5, color: "var(--c-green)", fontFamily: "JetBrains Mono, monospace" }}>{inv.status}</span>
              <button onClick={() => success("Invoice downloaded", `Invoice for ${inv.date} is downloading.`)} style={{ fontSize: 12, color: "var(--c-accent)", background: "none", border: "none", cursor: "pointer" }}>Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────── */

export default function Settings() {
  const [tab, setTab] = useState<Tab>("profile");
  const TAB_COMPONENTS: Record<Tab, React.ReactNode> = {
    profile: <ProfileTab />,
    organization: <OrganizationTab />,
    team: <TeamTab />,
    notifications: <NotificationsTab />,
    billing: <BillingTab />,
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-[var(--c-bg)]">
      {/* left nav */}
      <aside className="w-full md:w-[210px] shrink-0 p-4 md:p-6 border-b md:border-b-0 md:border-r border-[var(--c-border2)] flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
        <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace", color: "var(--c-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, paddingLeft: 8 }}>Settings</div>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, textAlign: "left", background: tab === id ? "var(--c-accent-bg)" : "transparent", color: tab === id ? "var(--c-accent)" : "var(--c-muted)" }}
          >
            <Icon size={14} />
            {label}
            {tab === id && <ChevronRight size={12} style={{ marginLeft: "auto" }} />}
          </button>
        ))}
      </aside>

      {/* content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", maxWidth: 760 }} className="fade-in" key={tab}>
        {TAB_COMPONENTS[tab]}
      </div>
    </div>
  );
}
