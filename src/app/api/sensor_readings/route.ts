import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // We expect the ESP32 to send:
    // {
    //   "room_id": "Rajarata_Uni/Building_A/Room_101",
    //   "temp": 28.5,
    //   "humidity": 60.2,
    //   "noise_level": 55.4,
    //   "is_occupied": true,
    //   "light_status": true
    // }
    
    const { room_id, temp, humidity, noise_level, is_occupied, light_status } = body;

    if (!room_id) {
      return NextResponse.json({ error: "room_id is required from the ESP32" }, { status: 400 });
    }

    // Insert reading into tracking table without checking for user auth (service role used)
    const { data, error } = await supabase
      .from("sensor_readings")
      .insert([{
        room_id,
        temp,
        humidity,
        noise_level,
        is_occupied,
        light_status,
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error (sensor_readings):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error("Error processing sensor reading:", err);
    return NextResponse.json({ error: "Invalid sensor data payload" }, { status: 400 });
  }
}
