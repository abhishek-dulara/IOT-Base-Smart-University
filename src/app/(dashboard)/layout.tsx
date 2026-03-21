"use client";

import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { useEffect, useState } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Read initial state
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);

    // Listen for toggle events from sidebar
    const handler = (e: Event) => {
      setCollapsed((e as CustomEvent).detail);
    };
    window.addEventListener("sidebar-toggle", handler);
    return () => window.removeEventListener("sidebar-toggle", handler);
  }, []);

  return (
    <div className={`app-layout ${collapsed ? "sidebar-is-collapsed" : ""}`}>
      <Sidebar />
      <div className="main-wrapper">
        <TopNavbar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
