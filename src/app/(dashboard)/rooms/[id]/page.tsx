"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RoomDetails {
  room_id: string;
  name: string;
  code: string;
  type: string;
  building_id: string;
  floor_id: string | null;
  is_public_destination: boolean;
  building?: { name: string };
  floor?: { name: string; level: number };
}

interface RoomStatus {
  occupancy: string | null;
  temperature_c: number | null;
  ghost_cooling_active: boolean | null;
}

export default function RoomDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [status, setStatus] = useState<RoomStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch base room details
      const roomRes = await fetch(`/api/rooms/${id}`, { headers, cache: "no-store" });
      if (!roomRes.ok) throw new Error("Failed to fetch room details");
      const roomData = await roomRes.json();

      // Fetch room status
      const statusRes = await fetch(`/api/rooms/${id}/status`, { headers, cache: "no-store" });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatus(statusData);
      } else {
        setStatus({ occupancy: null, temperature_c: null, ghost_cooling_active: null });
      }

      setRoom(roomData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load room");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoomData();
    // Auto-refresh environment data every 30 seconds
    const interval = setInterval(fetchRoomData, 30000);
    return () => clearInterval(interval);
  }, [fetchRoomData]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>{error || "Room Not Found"}</h3>
        <button className="btn btn-outline" onClick={() => router.push("/rooms")} style={{ marginTop: 16 }}>
          Back to Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="room-details-page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <button 
          className="btn btn-ghost" 
          onClick={() => router.push("/rooms")}
          style={{ padding: "8px", marginTop: "2px" }}
          title="Back to Rooms"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <h2 style={{ margin: 0 }}>{room.name || "Unnamed Room"}</h2>
            <span className="badge blue">{room.type}</span>
          </div>
          <p>
            {room.code ? `${room.code} • ` : ""}
            {room.building?.name || "Unknown Building"}
            {room.floor ? ` • ${room.floor.name} (Lvl ${room.floor.level})` : ""}
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchRoomData}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          Refresh Data
        </button>
      </div>

      <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 32, marginBottom: 16, color: "var(--text-primary)" }}>
        Environment & System Status
      </h3>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {/* Occupancy Card */}
        <div className="card animate-in" style={{ padding: 24, display: "flex", flexDirection: "column", animationDelay: "0.05s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", color: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              👥
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Room Occupancy</h4>
            </div>
          </div>
          <div style={{ marginTop: "auto" }}>
            {status?.occupancy === "OCCUPIED" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-green)", fontSize: 24, fontWeight: 600 }}>
                <span className="badge-dot" style={{ width: 12, height: 12, background: "var(--accent-green)" }} />
                Occupied
              </div>
            ) : status?.occupancy === "VACANT" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 24, fontWeight: 600 }}>
                <span className="badge-dot" style={{ width: 12, height: 12, background: "var(--text-muted)" }} />
                Vacant
              </div>
            ) : (
              <div style={{ fontSize: 24, fontWeight: 600, color: "var(--text-secondary)" }}>Data Unavailable</div>
            )}
          </div>
        </div>

        {/* Temperature Card */}
        <div className="card animate-in" style={{ padding: 24, display: "flex", flexDirection: "column", animationDelay: "0.1s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(245, 158, 11, 0.1)", color: "var(--accent-amber)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🌡️
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Temperature</h4>
            </div>
          </div>
          <div style={{ marginTop: "auto" }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "baseline", gap: 4 }}>
              {status?.temperature_c != null ? status.temperature_c.toFixed(1) : "—"}
              <span style={{ fontSize: 18, color: "var(--text-muted)", fontWeight: 500 }}>°C</span>
            </div>
          </div>
        </div>

        {/* Ghost Cooling Card */}
        <div className="card animate-in" style={{ padding: 24, display: "flex", flexDirection: "column", animationDelay: "0.15s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              ❄️
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>HVAC Ghost Cooling</h4>
            </div>
          </div>
          <div style={{ marginTop: "auto" }}>
            {status?.ghost_cooling_active ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="badge amber" style={{ fontSize: 14, padding: "6px 12px" }}>
                  <span className="badge-dot" /> Warning: Active
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
                <span className="badge neutral" style={{ fontSize: 14, padding: "6px 12px" }}>
                  Inactive
                </span>
              </div>
            )}
            <p style={{ margin: "12px 0 0 0", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>
              {status?.ghost_cooling_active 
                ? "Cooling is active while the room is vacant, indicating potential energy waste."
                : "Cooling system is operating normally based on occupancy."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
