"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/buildings", label: "Buildings", icon: "🏢" },
  { href: "/rooms", label: "Rooms", icon: "🚪" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/reports", label: "Reports", icon: "📄" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">N</div>
        <h1>NavSense</h1>
      </div>

      <div className="sidebar-section-label">Main Menu</div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${
              pathname.startsWith(item.href) ? "active" : ""
            }`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-section-label">System</div>
      <div className="sidebar-link" style={{ cursor: "default" }}>
        <span className="sidebar-link-icon">⚡</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Realtime Active
        </span>
        <span className="live-dot" style={{ marginLeft: "auto" }} />
      </div>
    </aside>
  );
}
