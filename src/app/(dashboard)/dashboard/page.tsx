"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/StatCard";
import { useRealtime } from "@/hooks/useRealtime";

interface DashboardStats {
  buildings: number;
  rooms: number;
  sensors: number;
  activeAlerts: number;
}

interface Reading {
  reading_id: string;
  node_id: string;
  room_id: string;
  temperature_c: number | null;
  noise_db: number | null;
  light_lux: number | null;
  occupancy_detected: boolean | null;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    buildings: 0,
    rooms: 0,
    sensors: 0,
    activeAlerts: 0,
  });
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const [buildingsRes, roomsRes, sensorsRes, alertsRes, readingsRes] =
        await Promise.all([
          fetch("/api/buildings", { headers }),
          fetch("/api/rooms", { headers }),
          fetch("/api/sensors", { headers }),
          fetch("/api/alerts", { headers }),
          fetch("/api/readings?limit=10", { headers }),
        ]);

      const [buildings, rooms, sensors, alerts, recentReadings] =
        await Promise.all([
          buildingsRes.json(),
          roomsRes.json(),
          sensorsRes.json(),
          alertsRes.json(),
          readingsRes.json(),
        ]);

      setStats({
        buildings: Array.isArray(buildings) ? buildings.length : 0,
        rooms: Array.isArray(rooms) ? rooms.length : 0,
        sensors: Array.isArray(sensors) ? sensors.length : 0,
        activeAlerts: Array.isArray(alerts) ? alerts.length : 0,
      });

      if (Array.isArray(recentReadings)) {
        setReadings(recentReadings);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Realtime: subscribe to new readings
  useRealtime<Reading>(
    { table: "readings", event: "INSERT" },
    (newReading) => {
      setReadings((prev) => [newReading, ...prev.slice(0, 9)]);
    }
  );

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
        <h2>Dashboard</h2>
        <p>Real-time overview of your smart campus</p>
      </div>

      <div className="card-grid" style={{ marginBottom: 32 }}>
        <StatCard
          icon="🏢"
          label="Total Buildings"
          value={stats.buildings}
          sub="Registered buildings"
          color="blue"
        />
        <StatCard
          icon="🚪"
          label="Total Rooms"
          value={stats.rooms}
          sub="Monitored rooms"
          color="green"
        />
        <StatCard
          icon="📡"
          label="Active Sensors"
          value={stats.sensors}
          sub="Connected nodes"
          color="amber"
        />
        <StatCard
          icon="🔔"
          label="Active Alerts"
          value={stats.activeAlerts}
          sub="Require attention"
          color="red"
        />
      </div>

      <div className="table-container animate-in">
        <div className="table-header">
          <h3>Recent Readings</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="live-dot" />
            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                fontWeight: 500,
              }}
            >
              Live
            </span>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Node</th>
              <th>Temp °C</th>
              <th>Noise dB</th>
              <th>Light lux</th>
              <th>Occupancy</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {readings.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 40 }}>
                  No readings yet. Insert sensor data to see live updates.
                </td>
              </tr>
            ) : (
              readings.map((r) => (
                <tr key={r.reading_id}>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {r.node_id}
                  </td>
                  <td>{r.temperature_c ?? "—"}</td>
                  <td>{r.noise_db ?? "—"}</td>
                  <td>{r.light_lux ?? "—"}</td>
                  <td>
                    <span
                      className={`badge ${r.occupancy_detected ? "green" : "red"}`}
                    >
                      <span className="badge-dot" />
                      {r.occupancy_detected ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {new Date(r.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
