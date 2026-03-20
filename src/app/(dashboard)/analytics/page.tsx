"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";

interface AnalyticsData {
  avgTemperature: number;
  occupancyRate: number;
  totalReadings: number;
  totalRoomsMonitored: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const res = await fetch("/api/analytics", { headers });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Analytics</h2>
        <p>AI-powered insights and historical trends</p>
      </div>

      <div className="card-grid" style={{ marginBottom: 32 }}>
        <StatCard
          icon="🌡"
          label="Avg Campus Temp"
          value={data?.avgTemperature ? `${data.avgTemperature}°C` : "—"}
          sub="Based on recent readings"
          color="blue"
        />
        <StatCard
          icon="👥"
          label="Occupancy Rate"
          value={data?.occupancyRate != null ? `${data.occupancyRate}%` : "—"}
          sub="Overall campus utilization"
          color="green"
        />
        <StatCard
          icon="📈"
          label="Data Points"
          value={data?.totalReadings || 0}
          sub="Recent telemetry processed"
          color="amber"
        />
        <StatCard
          icon="🏢"
          label="Measured Rooms"
          value={data?.totalRoomsMonitored || 0}
          sub="Rooms supplying data"
          color="purple"
        />
      </div>

      <div className="card animate-in">
        <h3 style={{ marginBottom: 16 }}>Key Insights</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          <li style={{ padding: "12px 0", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "12px", alignItems: "center" }}>
             <span className="badge amber">💡 Suggestion</span>
             <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
               Consider optimizing HVAC systems; Ghost Cooling instances frequently occur between 18:00 and 22:00.
             </span>
          </li>
          <li style={{ padding: "12px 0", display: "flex", gap: "12px", alignItems: "center" }}>
             <span className="badge green">✨ Usage</span>
             <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
               Highest average occupancy detected in the "Labs" zone today.
             </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
