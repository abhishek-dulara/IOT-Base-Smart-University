"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import IoTDashboard from "@/components/IoTDashboard";

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
      
      <IoTDashboard roomId={id} />
    </div>
  );
}
