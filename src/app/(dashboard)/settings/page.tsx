"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error("Failed to parse user data", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <p>Manage your account and system preferences</p>
      </div>

      <div className="card-grid">
        <div className="card animate-in">
          <h3 style={{ marginBottom: 24, fontSize: 18, fontWeight: 600 }}>User Profile</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
            <div>
              <label className="form-label" style={{ color: "var(--text-muted)" }}>Name</label>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{user?.name || "Loading..."}</div>
            </div>
            <div>
              <label className="form-label" style={{ color: "var(--text-muted)" }}>Email</label>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{user?.email || "Loading..."}</div>
            </div>
            <div>
              <label className="form-label" style={{ color: "var(--text-muted)" }}>Role Access Level</label>
              <div>
                <span className="badge purple">{user?.role || "USER"}</span>
              </div>
            </div>
          </div>

          <button className="btn btn-danger" onClick={handleLogout} style={{ width: "100%", justifyContent: "center" }}>
            Sign Out
          </button>
        </div>

        <div className="card animate-in" style={{ animationDelay: "0.1s" }}>
           <h3 style={{ marginBottom: 24, fontSize: 18, fontWeight: 600 }}>Preferences</h3>
           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-color)" }}>
              <div>
                 <div style={{ fontWeight: 500 }}>Global Alerts Sound</div>
                 <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Play a sound when a high severity anomaly occurs</div>
              </div>
              <button className="btn btn-secondary btn-sm" disabled style={{ opacity: 0.5 }}>Enabled</button>
           </div>
           
           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-color)" }}>
              <div>
                 <div style={{ fontWeight: 500 }}>Theme Mode</div>
                 <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Currently locked to deeply immersive dark mode</div>
              </div>
              <span className="badge blue">Dark</span>
           </div>
        </div>
      </div>
    </div>
  );
}
