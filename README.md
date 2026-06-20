<div align="center">

<br/>

```
███╗   ██╗ █████╗ ██╗   ██╗███████╗███████╗███╗   ██╗███████╗███████╗
████╗  ██║██╔══██╗██║   ██║██╔════╝██╔════╝████╗  ██║██╔════╝██╔════╝
██╔██╗ ██║███████║██║   ██║███████╗█████╗  ██╔██╗ ██║███████╗█████╗  
██║╚██╗██║██╔══██║╚██╗ ██╔╝╚════██║██╔══╝  ██║╚██╗██║╚════██║██╔══╝  
██║ ╚████║██║  ██║ ╚████╔╝ ███████║███████╗██║ ╚████║███████║███████╗
╚═╝  ╚═══╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝
```

### Smart Building Management System

**Real-time IoT monitoring, occupancy tracking, and environmental analytics  
for modern university campuses.**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Deno](https://img.shields.io/badge/Deno-000000?style=for-the-badge&logo=deno&logoColor=white)](https://deno.land/)

<br/>

![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Node](https://img.shields.io/badge/node-v18+-green?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

</div>

---

## Overview

NavSense is a production-ready, full-stack IoT Smart University Management dashboard. It streams live sensor data from physical hardware (ESP32) directly into a polished, real-time web interface — giving facility managers a complete picture of building occupancy, environmental conditions, and system anomalies across an entire campus.

Built natively on the **Next.js 16 App Router**, **React 19**, and **Supabase**, NavSense is engineered for performance, security, and scale.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📡 **Real-Time IoT Monitoring** | Live sensor data streams (temperature, sound, light, motion) powered by Supabase Edge Functions |
| 🏢 **Smart Occupancy Tracking** | Room-level occupancy with trend analysis and historical timelines |
| 🌡️ **Environmental Analytics** | Deep insights into building environments affecting comfort and energy usage |
| 🚨 **Automated Alerting** | Configurable anomaly detection (Ghost Cooling, Extreme Temps) with severity-based notifications |
| 🏛️ **Multi-Building Management** | Full CRUD operations designed to scale across complex university campuses |
| 🔐 **Role-Based Access Control** | Super Admin and Admin roles with stateless JWT authentication, plus root account protection |
| 📧 **Password Recovery** | Secure forgot password and reset workflows powered by Nodemailer |
| 📊 **Report Generation** | Comprehensive, downloadable CSV timeline exports for rooms, sensors, and alerts |
| 🎨 **Striking UI/UX** | Custom glassmorphism components, 3D CSS flip animations, and glowing interactive states |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework — Frontend + API Routes |
| **UI** | React 19 + TypeScript | Composable components with strict type safety |
| **Styling** | Standard CSS (Globals) | 3D animations, gradients, glassmorphism — no Tailwind needed |
| **Database** | Supabase (PostgreSQL) | Primary data store, Realtime APIs, Row-Level Security |
| **Edge Functions** | Deno (via Supabase) | Serverless IoT simulator and sensor data ingestion |
| **Auth & Email** | Bcrypt.js, JWT, Nodemailer | Custom stateless authentication, password hashing, and secure email recovery |
| **Charts** | Recharts | Dynamic, animated sensor data visualizations |

---

## 📂 Project Structure

```
📦 IOT-Base-Smart-University
 ┣ 📂 public/                   # Static assets (images, fonts)
 ┣ 📂 src/
 ┃ ┣ 📂 app/                    # Next.js App Router
 ┃ ┃ ┣ 📂 (dashboard)/          # Authenticated app interface routes
 ┃ ┃ ┣ 📂 api/                  # Next.js API Route Handlers (backend layer)
 ┃ ┃ ┣ 📂 login/                # Authentication page (3D flip card UI)
 ┃ ┃ ┣ 📜 layout.tsx            # Root layout
 ┃ ┃ ┗ 📜 page.tsx              # Landing entry point
 ┃ ┣ 📂 components/             # Reusable React UI components & charts
 ┃ ┣ 📂 hooks/                  # Custom React hooks
 ┃ ┗ 📂 lib/
 ┃   ┗ 📂 services/             # Supabase DB wrappers (users, rooms, sensors)
 ┣ 📂 supabase/
 ┃ ┣ 📂 functions/              # Deno Edge Functions (IoT data simulator)
 ┃ ┣ 📜 schema.sql              # Full database schema with relationships
 ┃ ┗ 📜 rls_security.sql        # Row-Level Security policies
 ┣ 📜 .env.local                # Environment variables (git-ignored)
 ┣ 📜 package.json
 ┗ 📜 tailwind.config.ts
```

---

## 🗄️ Database Schema

NavSense uses a relational **PostgreSQL** database managed by Supabase with the following core tables:

```
users          → Admin credentials, roles, and profiles
buildings      → Physical campus structures
rooms          → Specific rooms within each building
room_status    → Live availability tracking (reserved, free, etc.)
sensor_nodes   → Physical hardware devices (ESP32 / Raspberry Pi) per room
readings       → Time-series log of all sensor emissions (Temp, Lux, Noise dB, Motion)
anomalies      → System-generated alerts for unusual conditions (e.g., Ghost Cooling)
```

---

## ⚙️ Backend Architecture

NavSense runs on a clean **3-tier architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│  1. CLIENT                                                       │
│     React components → HTTP fetch → /api/* routes               │
├─────────────────────────────────────────────────────────────────┤
│  2. NEXT.JS API LAYER (route.ts handlers)                        │
│     JWT verification → Business logic → Supabase JS client      │
├─────────────────────────────────────────────────────────────────┤
│  3. SUPABASE                                                     │
│     PostgreSQL transactions → Realtime subscriptions → Clients  │
│     ↑                                                            │
│     ESP32 hardware / Deno edge functions (sensor ingestion)      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📄 Pages & Routes

| Page | Route | Description |
|---|---|---|
| Login | `/login` | 3D flip-card authentication interface |
| Reset Password | `/reset-password` | Secure account recovery and password reset |
| Dashboard | `/dashboard` | System overview, ambient KPIs, fast metrics |
| Buildings | `/buildings` | Building & infrastructure CRUD |
| Rooms | `/rooms` | Room definitions and sensor node mapping |
| Alerts | `/alerts` | Severity-based anomaly investigation log |
| Analytics | `/analytics` | Interactive charts and sensor trend histories |
| Reports | `/reports` | Data generation and export tools |
| Settings | `/settings` | System configuration and profile management |

> All authenticated routes are protected by a layout-level server session verifier.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- A **Supabase** project ([create one free](https://supabase.com))

### 1. Clone & Install

```bash
git clone https://github.com/your-username/IOT-Base-Smart-University.git
cd IOT-Base-Smart-University
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=super_secret_navsense_smart_university_key_2026_xyz

# Nodemailer configuration for Password Recovery emails
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Never commit `.env.local` or expose your `SUPABASE_SERVICE_ROLE_KEY` publicly.**

### 3. Initialize the Database

1. Open your **Supabase Dashboard → SQL Editor**
2. Copy and run `supabase/schema.sql` to create all tables and relationships
3. Copy and run `supabase/rls_security.sql` to enable Row-Level Security policies

### 4. Create Demo Users

Recent security updates require a `SUPER_ADMIN` token to hit the `/api/auth/register` endpoint. Therefore, the very first root user must be inserted directly into the database. 

1. Open your **Supabase Dashboard → SQL Editor**
2. Run the following SQL to create your root Super Admin (Email: `super@navsense.io`, Password: `SuperAdmin123!`):

```sql
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Super Admin', 
  'super@navsense.io', 
  '$2b$12$kKzTFMU9vZmf2bJ4is5c9O/YJo6ALV9lx7XEpuRT17nu8zy2X0RKG', 
  'SUPER_ADMIN'
);
```

> 💡 **Tip: Custom Passwords**
> If you want to use a different password, you can generate your own bcrypt hash (cost: 12) by running this in your terminal:
> ```bash
> node -e "console.log(require('bcryptjs').hashSync('YourCustomPassword!', 12))"
> ```
> Then substitute the resulting hash into the SQL command above.

3. Once logged in as `super@navsense.io` in the app, you can create additional accounts through the NavSense User Management UI, or use the API with your Bearer token.

### 5. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | `super@navsense.io` | `SuperAdmin123!` |
| Admin | `admin@navsense.io` | `Admin1234!` |

---

## 🔌 ESP32 Hardware Integration

NavSense is designed to work with physical ESP32 sensor nodes out of the box.

### Configuration (`esp32.ino`)

Before flashing, update these three values in your Arduino sketch:

```cpp
// 1. Room ID — must match the ID in your Supabase `rooms` table
#define TARGET_ROOM_ID "your-room-id-here"

// 2. Wi-Fi credentials for the room's network
#define WIFI_SSID     "your-network-name"
#define WIFI_PASSWORD "your-network-password"

// 3. Your computer's local IP running the Next.js server
#define NEXTJS_SERVER_URL "http://<YOUR_COMPUTER_IP>:3000/api/sensor_readings"
```

### Finding Your Room ID

**Option A — From the Dashboard URL:**
1. Navigate to **Rooms** in the NavSense dashboard
2. Click on a room to open its detail page
3. Copy the UUID from the browser's address bar:
   ```
   123e4567-e89b-12d3-a456-426614174000
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        This is your Room ID
   ```

**Option B — From Supabase:**
1. Open **Supabase Dashboard → Table Editor → rooms**
2. Copy the value from the `id` column for your target room

### Starting the Server for ESP32 Access

Instead of the default `npm run dev`, bind Next.js to your Wi-Fi interface so the ESP32 can reach it:

```bash
npx next dev -H 0.0.0.0
```

### Windows Firewall (if ESP32 cannot connect)

By default, Windows blocks external devices from reaching local ports over Wi-Fi. To fix this:

1. Open **Windows Defender Firewall → Advanced Settings**
2. Click **Inbound Rules → New Rule...**
3. Select **Port → TCP → Specific local ports:** `3000`
4. Select **Allow the connection**
5. Name it `Next.js Port 3000` and click **Finish**
6. Restart your ESP32 (press **EN** or replug it)

---

## 🎨 Design System

NavSense uses a bespoke dark-theme CSS variable system for visual consistency across all components:

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#0a0e1a` | App layout base — deepest background layer |
| `--bg-secondary` | `#111827` | Sidebar, navigation menus |
| `--bg-card` | `#1a1f2e` | Dashboard cards, tables, glassmorphism surfaces |
| `--accent-blue` | `#3b82f6` | Primary buttons, gradients, glowing borders |
| `--accent-cyan` | `#06b6d4` | Secondary highlights, micro-animations |
| `--text-primary` | `#f1f5f9` | Primary readable typography |
| `--text-muted` | `#64748b` | Data labels, empty states, system text |

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change. Pull requests should target the `main` branch with a clear description of your changes.

---

<div align="center">
  <sub>Built with ⚡ by the NavSense team — powering smarter campuses.</sub>
</div>