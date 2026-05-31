"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/buildings", label: "Buildings", icon: "🏢" },
  { href: "/rooms", label: "Rooms", icon: "🚪" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/reports", label: "Reports", icon: "📄" },
  { href: "/users", label: "User Management", icon: "👥", superAdminOnly: true },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setRole(user.role);
      } catch (e) {}
    }
    // Restore collapsed state
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
    // Dispatch event so layout can react
    window.dispatchEvent(new CustomEvent("sidebar-toggle", { detail: next }));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Even if the API call fails, clear client-side state
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  const filteredNav = navItems.filter((item) => 
    !(("superAdminOnly" in item) && (item as any).superAdminOnly === true) || role === "SUPER_ADMIN"
  );

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Collapse/Expand Toggle — on the sidebar border line */}
      <button
        className="sidebar-toggle-btn"
        onClick={toggleCollapse}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s ease" }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">N</div>
        {!collapsed && <h1>NavSens</h1>}
      </div>

      {!collapsed && <div className="sidebar-section-label">Main Menu</div>}

      <nav className="sidebar-nav">
        {filteredNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${
              pathname.startsWith(item.href) ? "active" : ""
            }`}
            title={collapsed ? item.label : undefined}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {!collapsed && item.label}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button
          className="sidebar-link sidebar-logout-btn"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
        >
          <span className="sidebar-link-icon">🚪</span>
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
