"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
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

export default function RoomDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const roomRes = await fetch(`/api/rooms/${id}`, { headers, cache: "no-store" });
      if (!roomRes.ok) throw new Error("Failed to fetch room details");
      const roomData = await roomRes.json();

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
      {/* Header */}
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <button className="btn btn-ghost" onClick={() => router.push("/rooms")} style={{ padding: 8, marginTop: 2 }} title="Back to Rooms">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <h2 style={{ margin: 0 }}>{room.name || "Unnamed Room"}</h2>
            <span className="badge blue">{room.type}</span>
          </div>
          <p>
            {room.code ? `${room.code} • ` : ""}
            {room.building?.name || "Unknown Building"}
            {room.floor ? ` • ${room.floor.name} (Lvl ${room.floor.level})` : ""}
          </p>
        </div>
      </div>

      {/* Unified IoT Dashboard — realtime sensor data */}
      <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 32, marginBottom: 16, color: "var(--text-primary)" }}>
        Environment &amp; System Status
      </h3>

      <IoTDashboard roomId={id} />
    </div>
  );
}
