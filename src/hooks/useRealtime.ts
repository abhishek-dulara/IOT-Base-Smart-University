"use client";

import { useEffect, useState } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface RealtimeOptions {
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  schema?: string;
  filter?: string;
}

export function useRealtime<T>(
  options: RealtimeOptions,
  onPayload: (payload: T) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return;

    const client = createClient(supabaseUrl, supabaseAnonKey);
    const channelName = `realtime-${options.table}`;

    const ch = client
      .channel(channelName)
      .on(
        "postgres_changes" as never,
        {
          event: options.event || "*",
          schema: options.schema || "public",
          table: options.table,
          ...(options.filter ? { filter: options.filter } : {}),
        },
        (payload: { new: T }) => {
          onPayload(payload.new);
        }
      )
      .subscribe();

    setChannel(ch);

    return () => {
      client.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.table, options.event, options.filter]);

  return channel;
}
