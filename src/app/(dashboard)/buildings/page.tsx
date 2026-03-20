"use client";

import { useEffect, useState, useCallback } from "react";

interface Building {
  building_id: string;
  name: string;
  address: string;
  created_at: string;
  floors: { count: number }[];
  rooms: { count: number }[];
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBuildings = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const res = await fetch("/api/buildings", { headers });
      const data = await res.json();
      if (Array.isArray(data)) setBuildings(data);
    } catch (err) {
      console.error("Failed to fetch buildings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

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
        <h2>Buildings</h2>
        <p>Manage campus buildings and infrastructure</p>
      </div>

      {buildings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏢</div>
          <h3>No Buildings Yet</h3>
          <p>Add buildings through the API to see them here.</p>
        </div>
      ) : (
        <div className="card-grid">
          {buildings.map((b) => (
            <div key={b.building_id} className="card animate-in">
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                {b.name || "Unnamed Building"}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginBottom: 16,
                }}
              >
                {b.address || "No address"}
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <span className="badge blue">
                  {b.floors?.[0]?.count ?? 0} Floors
                </span>
                <span className="badge purple">
                  {b.rooms?.[0]?.count ?? 0} Rooms
                </span>
              </div>
              <div
                style={{
                  marginTop: 16,
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}
              >
                Added {new Date(b.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
