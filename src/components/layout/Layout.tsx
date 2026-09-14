import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse, Truck,
  BarChart2, Bell, Settings, ChevronDown, User, Sun, Moon,
  AlertTriangle, LogOut, Crown, Menu, X
} from "lucide-react";
import { useAuth } from "@/features/Auth/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotification } from "@/contexts/NotificationContext";
import { LogoMark } from "@/components/ui/Logo";
import ToastContainer from "@/components/ui/Toast";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: ShoppingCart, badge: "1.2k" },
  { to: "/inventory", label: "Inventory", icon: Package, badge: "47" },
  { to: "/warehouses", label: "Warehouses", icon: Warehouse },
  { to: "/shipments", label: "Shipments", icon: Truck },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle, badge: "6" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { info } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    info("Signed out", "You have been logged out successfully.");
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--c-bg)] text-[var(--c-text)]">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-64 md:w-52 bg-[var(--c-sidebar)] border-r border-[var(--c-border2)] flex flex-col transform transition-transform duration-200 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* logo */}
        <div className="h-14 flex items-center justify-between gap-2 px-4 border-b border-[var(--c-border2)] shrink-0">
          <div className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <div>
              <div className="text-[15px] font-extrabold tracking-tight text-[var(--c-text)] leading-none">Nexora</div>
              <div className="text-[9px] font-mono text-[var(--c-dim)] tracking-[0.12em] uppercase">Distribution</div>
            </div>
          </div>
          <button className="md:hidden p-1 text-[var(--c-muted)] hover:bg-[var(--c-surface2)] rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* org */}
        <div className="p-2 border-b border-[var(--c-border2)]">
          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer hover:bg-[var(--c-surface2)] transition-colors">
            <div>
              <div className="text-[11px] font-semibold text-[var(--c-text)]">{user?.tenant?.name || "No Tenant"}</div>
              <div className="text-[9px] font-mono text-[var(--c-dim)]">{user?.tenantId || "SAAS-ROOT"}</div>
            </div>
            <ChevronDown size={12} color="var(--c-dim)" />
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 p-2 overflow-y-auto flex flex-col gap-0.5">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `flex items-center justify-between py-2 px-2.5 rounded-lg text-[12.5px] font-medium no-underline transition-colors ${isActive ? 'bg-[var(--c-accent-bg)] text-[var(--c-accent)]' : 'text-[var(--c-muted)] hover:bg-[var(--c-surface3)]'}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={13.5} />
                {label}
              </div>
              {badge && (
                <span className="text-[9px] font-mono py-0.5 px-1.5 rounded bg-[var(--c-surface3)] text-[var(--c-dim)]">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}

          {user?.role === "owner" && (
            <NavLink
              to="/owner"
              className={({ isActive }) => `flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-[12.5px] font-medium mt-2 no-underline transition-colors ${isActive ? 'bg-[var(--c-purple-bg)] text-[var(--c-purple)]' : 'text-[var(--c-muted)] hover:bg-[var(--c-surface3)]'}`}
            >
              <Crown size={13.5} />
              Owner Admin
            </NavLink>
          )}
        </nav>

        {/* bottom */}
        <div className="p-2 border-t border-[var(--c-border2)]">
          <NavLink
            to="/settings"
            className={({ isActive }) => `flex items-center gap-2 w-full py-2 px-2.5 rounded-lg text-[12.5px] font-medium no-underline transition-colors ${isActive ? 'bg-[var(--c-surface3)] text-[var(--c-text)]' : 'text-[var(--c-muted)] hover:bg-[var(--c-surface3)]'}`}
          >
            <Settings size={13} />
            Settings
          </NavLink>

          {/* user */}
          <div className="relative mt-1">
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-2 w-full py-1.5 px-2 bg-transparent border-none cursor-pointer rounded-lg hover:bg-[var(--c-surface2)] transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--c-accent)] to-[var(--c-cyan)] flex items-center justify-center shrink-0">
                <User size={12} color="#fff" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="text-[11.5px] font-semibold text-[var(--c-text)] truncate">{user?.name}</div>
                <div className="text-[9.5px] font-mono text-[var(--c-dim)] capitalize">{user?.role}</div>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute bottom-[calc(100%+4px)] left-0 right-0 bg-[var(--c-surface)] border border-[var(--c-border)] rounded-xl p-1.5 shadow-lg z-50 fade-in">
                <NavLink to="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 w-full py-1.5 px-2.5 bg-transparent border-none cursor-pointer rounded-lg text-xs text-[var(--c-muted)] no-underline hover:bg-[var(--c-surface2)] transition-colors">
                  <Settings size={12} /> Account Settings
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full py-1.5 px-2.5 bg-transparent border-none cursor-pointer rounded-lg text-xs text-[var(--c-red)] hover:bg-[var(--c-red-bg)] transition-colors mt-0.5"
                >
                  <LogOut size={12} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* topbar */}
        <header className="bg-[var(--c-topbar)] border-b border-[var(--c-border2)] h-14 flex items-center px-4 md:px-5 gap-3 shrink-0">
          <button
            className="md:hidden p-1.5 -ml-1.5 text-[var(--c-muted)] rounded-lg hover:bg-[var(--c-surface2)] transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <div className="hidden md:flex items-center gap-1.5 font-mono text-[10.5px] text-[var(--c-dim)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--c-green)] pulse-dot" />
            Live · Sep 10, 2026
          </div>

          <button
            onClick={toggle}
            title="Toggle theme"
            className="w-8 h-8 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] cursor-pointer flex items-center justify-center text-[var(--c-muted)] hover:bg-[var(--c-surface3)] transition-colors"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button className="w-8 h-8 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface2)] cursor-pointer flex items-center justify-center text-[var(--c-muted)] hover:bg-[var(--c-surface3)] transition-colors relative">
            <Bell size={14} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--c-red)] border-2 border-[var(--c-topbar)]" />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
