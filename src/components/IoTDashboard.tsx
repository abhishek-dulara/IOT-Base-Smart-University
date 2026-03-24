"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize a client-side Supabase instance
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface SensorReading {
  id: number;
  room_id: string;
  created_at: string;
  temp: number | null;
  humidity: number | null;
  noise_level: number | null;
  is_occupied: boolean | null;
  light_status: boolean | null;
}

export default function IoTDashboard({ roomId }: { roomId: string }) {
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;

    const fetchInitialData = async () => {
      try {
        const { data, error } = await supabase
          .from("sensor_readings")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "No rows returned"
          throw error;
        }

        if (data) {
          setReading(data as SensorReading);
        }
      } catch (err: any) {
        console.error("Error fetching IoT data:", err);
        setError("Failed to load sensor data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Subscribe to realtime updates for THIS room
    channel = supabase
      .channel(`sensor_readings_room_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensor_readings",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("New sensor reading received:", payload.new);
          setReading(payload.new as SensorReading);
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [roomId]);

  if (loading) {
    return (
      <div className="card" style={{ padding: 24, textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Connecting to IoT nodes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 24, borderLeft: "4px solid var(--accent-red)" }}>
        <p style={{ color: "var(--accent-red)", margin: 0 }}>{error}</p>
      </div>
    );
  }

  if (!reading) {
    return (
      <div className="card animate-in" style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, border: "2px dashed var(--border-color)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", color: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, boxShadow: "0 0 0 8px rgba(59, 130, 246, 0.05)" }}>
          📡
        </div>
        <div>
          <h3 style={{ margin: "0 0 12px 0", fontSize: 20, color: "var(--text-primary)" }}>Waiting for IoT Device Connection</h3>
          <p style={{ margin: "0 auto", color: "var(--text-muted)", maxWidth: 450, lineHeight: 1.6 }}>
            No sensor data has been received yet. Please configure your IoT node (ESP32/NodeMCU) to send data to this specific room using the Room ID below.
          </p>
        </div>
        
        <div style={{ 
          marginTop: 8, 
          padding: "16px 24px", 
          background: "var(--bg-secondary)", 
          borderRadius: "var(--radius-md)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center"
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Target Room ID for Sensor Node</span>
          <code style={{ fontSize: 16, color: "var(--accent-blue)", fontWeight: 700, padding: "8px 16px", background: "rgba(59, 130, 246, 0.1)", borderRadius: 6, letterSpacing: "1px" }}>
            {roomId}
          </code>
        </div>

        <div style={{ marginTop: 12 }}>
           <span className="badge blue" style={{ padding: "8px 16px", fontSize: 13 }}>
             <span className="badge-dot" style={{ animation: "pulse 1.5s infinite" }}/> 
             Listening for real-time sensor data...
           </span>
        </div>
      </div>
    );
  }

  // Energy Waste Alert Logic: Empty room but lights are ON
  const isEnergyWaste = reading.is_occupied === false && reading.light_status === true;

  const timeFormatted = new Date(reading.created_at).toLocaleTimeString();

  return (
    <div className="iot-dashboard animate-in">
      {isEnergyWaste && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          padding: "16px 20px",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          color: "var(--accent-red)"
        }}>
          <span style={{ fontSize: 24 }}>🚨</span>
          <div>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Energy Waste Alert</h4>
            <p style={{ margin: "2px 0 0 0", fontSize: 13, opacity: 0.9 }}>
              The room is vacant, but the lights are currently turned on.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        {/* Occupancy */}
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", color: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              👥
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Occupancy</h4>
            </div>
          </div>
          <div style={{ marginTop: "auto" }}>
            {reading.is_occupied ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent-green)", fontSize: 24, fontWeight: 600 }}>
                <span className="badge-dot" style={{ width: 12, height: 12, background: "var(--accent-green)" }} />
                Occupied
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 24, fontWeight: 600 }}>
                <span className="badge-dot" style={{ width: 12, height: 12, background: "var(--text-muted)" }} />
                Vacant
              </div>
            )}
          </div>
        </div>

        {/* Temperature & Humidity */}
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(245, 158, 11, 0.1)", color: "var(--accent-amber)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🌡️
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Climate</h4>
            </div>
          </div>
          <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Temperature</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "baseline", gap: 4 }}>
                {reading.temp != null ? reading.temp.toFixed(1) : "—"}
                <span style={{ fontSize: 16, color: "var(--text-muted)", fontWeight: 500 }}>°C</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Humidity</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "baseline", gap: 2 }}>
                {reading.humidity != null ? reading.humidity.toFixed(0) : "—"}
                <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Noise Level */}
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(168, 85, 247, 0.1)", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🔊
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Noise Level</h4>
            </div>
          </div>
          <div style={{ marginTop: "auto" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "baseline", gap: 4 }}>
              {reading.noise_level != null ? reading.noise_level.toFixed(0) : "—"}
              <span style={{ fontSize: 16, color: "var(--text-muted)", fontWeight: 500 }}>dB</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted)" }}>
              {reading.noise_level != null && reading.noise_level > 65 
                ? <span style={{ color: "var(--accent-amber)" }}>Loud environment</span> 
                : "Normal levels"}
            </div>
          </div>
        </div>

        {/* Lights */}
        <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(250, 204, 21, 0.1)", color: "#facc15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              💡
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Lighting</h4>
            </div>
          </div>
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
               width: 50, height: 28, borderRadius: 14, 
               background: reading.light_status ? "var(--accent-green)" : "var(--border-color)",
               position: "relative",
               transition: "background 0.3s"
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%", background: "white",
                position: "absolute", top: 4, left: reading.light_status ? 26 : 4,
                transition: "left 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 500, color: reading.light_status ? "var(--text-primary)" : "var(--text-muted)" }}>
              {reading.light_status ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "right", marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
        Last synchronized: {timeFormatted}
      </div>
    </div>
  );
}
