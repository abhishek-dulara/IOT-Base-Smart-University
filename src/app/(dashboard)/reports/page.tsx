"use client";

import { useState } from "react";

export default function ReportsPage() {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const handleDownload = async (format: "json" | "csv") => {
    try {
      setDownloadingFormat(format);
      const token = localStorage.getItem("token");
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const res = await fetch(`/api/reports?format=${format}`, { headers });
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `navsense-report-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(`Failed to download ${format} report:`, err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Reports</h2>
        <p>Export facility status, alerts, and occupancy data</p>
      </div>

      <div className="card-grid">
        <div className="card animate-in">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
             <div className="stat-card-icon green" style={{ width: 48, height: 48, fontSize: 24 }}>
               📊
             </div>
             <div>
               <h3 style={{ fontSize: 18, fontWeight: 600 }}>CSV Export</h3>
               <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Download spreadsheet format</p>
             </div>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
             A comprehensive list of all rooms, current occupancy statuses, environmental conditions, and anomalies formatted for Microsoft Excel or Google Sheets.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => handleDownload("csv")}
            disabled={downloadingFormat === "csv"}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {downloadingFormat === "csv" ? "Generating..." : "Download CSV Document"}
          </button>
        </div>

        <div className="card animate-in" style={{ animationDelay: "0.1s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
             <div className="stat-card-icon blue" style={{ width: 48, height: 48, fontSize: 24 }}>
               {`{}`}
             </div>
             <div>
               <h3 style={{ fontSize: 18, fontWeight: 600 }}>JSON Export</h3>
               <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Download developer format</p>
             </div>
          </div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
             A complete raw data dump of the entire facility including nested arrays of buildings, rooms, recent telemetry, and active system alerts.
          </p>
          <button 
            className="btn btn-ghost" 
            onClick={() => handleDownload("json")}
            disabled={downloadingFormat === "json"}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {downloadingFormat === "json" ? "Generating..." : "Download JSON Package"}
          </button>
        </div>
      </div>
    </div>
  );
}
