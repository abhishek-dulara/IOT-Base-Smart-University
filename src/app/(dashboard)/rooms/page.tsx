"use client";

import { useEffect, useState, useCallback } from "react";

interface RoomStatus {
  occupancy: string | null;
  temperature_c: number | null;
  ghost_cooling_active: boolean | null;
}

interface Room {
  room_id: string;
  name: string;
  code: string;
  type: string;
  is_public_destination: boolean;
  created_at: string;
  room_status: RoomStatus | null;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const res = await fetch("/api/rooms", { headers });
      const data = await res.json();
      if (Array.isArray(data)) setRooms(data);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

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
        <h2>Rooms</h2>
        <p>Monitor room occupancy and environmental conditions</p>
      </div>

      {rooms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚪</div>
          <h3>No Rooms Yet</h3>
          <p>Add rooms through the API to see them here.</p>
        </div>
      ) : (
        <div className="table-container animate-in">
          <div className="table-header">
            <h3>All Rooms</h3>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {rooms.length} rooms
            </span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Type</th>
                <th>Occupancy</th>
                <th>Temperature</th>
                <th>Ghost Cooling</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.room_id}>
                  <td
                    style={{
                      color: "var(--text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    {room.name || "Unnamed"}
                  </td>
                  <td>{room.code || "—"}</td>
                  <td>
                    <span className="badge blue">{room.type}</span>
                  </td>
                  <td>
                    {room.room_status?.occupancy ? (
                      <span
                        className={`badge ${room.room_status.occupancy === "OCCUPIED" ? "green" : "red"}`}
                      >
                        <span className="badge-dot" />
                        {room.room_status.occupancy}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>
                        Unknown
                      </span>
                    )}
                  </td>
                  <td>
                    {room.room_status?.temperature_c != null
                      ? `${room.room_status.temperature_c}°C`
                      : "—"}
                  </td>
                  <td>
                    {room.room_status?.ghost_cooling_active ? (
                      <span className="badge amber">
                        <span className="badge-dot" />
                        Active
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
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
