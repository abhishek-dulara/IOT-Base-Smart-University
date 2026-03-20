"use client";

import { useEffect, useState, useCallback } from "react";
import { useRealtime } from "@/hooks/useRealtime";

interface Anomaly {
  anomaly_id: string;
  type: string;
  severity: string;
  message: string;
  is_active: boolean;
  start_at: string;
  end_at: string | null;
  room_id: string | null;
  node_id: string | null;
  rooms: { name: string; code: string } | null;
}

export default function AlertsPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const res = await fetch("/api/alerts", { headers });
      const data = await res.json();
      if (Array.isArray(data)) setAnomalies(data);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Realtime: listen for new anomalies
  useRealtime<Anomaly>(
    { table: "anomalies", event: "INSERT" },
    (newAnomaly) => {
      setAnomalies((prev) => [newAnomaly, ...prev]);
    }
  );

  const handleResolve = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      await fetch(`/api/alerts/${id}/resolve`, {
        method: "PUT",
        headers,
      });

      setAnomalies((prev) => prev.filter((a) => a.anomaly_id !== id));
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  const severityColor = (s: string) => {
    switch (s) {
      case "HIGH":
        return "red";
      case "MEDIUM":
        return "amber";
      default:
        return "blue";
    }
  };

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
        <h2>Alerts</h2>
        <p>Active anomalies and system alerts</p>
      </div>

      {anomalies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>All Clear</h3>
          <p>No active alerts. The campus is running smoothly.</p>
        </div>
      ) : (
        <div className="table-container animate-in">
          <div className="table-header">
            <h3>Active Alerts</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="live-dot" />
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                {anomalies.length} active
              </span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Severity</th>
                <th>Room</th>
                <th>Message</th>
                <th>Started</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a) => (
                <tr key={a.anomaly_id}>
                  <td
                    style={{
                      color: "var(--text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    {a.type.replace(/_/g, " ")}
                  </td>
                  <td>
                    <span className={`badge ${severityColor(a.severity)}`}>
                      <span className="badge-dot" />
                      {a.severity}
                    </span>
                  </td>
                  <td>{a.rooms?.name || a.room_id || "—"}</td>
                  <td>{a.message}</td>
                  <td style={{ fontSize: 12 }}>
                    {new Date(a.start_at).toLocaleString()}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleResolve(a.anomaly_id)}
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
