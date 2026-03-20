import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NavSense — Smart Campus Monitoring",
  description:
    "IoT-based smart university monitoring system with realtime sensor data, occupancy tracking, and anomaly detection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
