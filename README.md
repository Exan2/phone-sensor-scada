# 🎛️ Android SCADA Dashboard

<div align="center">

**A cinematic real-time SCADA system that transforms your Android phone into a live sensor monitoring hub**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack)

</div>

---

## 🌟 Overview

Android SCADA Dashboard is a full-stack **Supervisory Control and Data Acquisition (SCADA)** system featuring a stunning cinematic interface. It bridges your Android device with a futuristic web dashboard to visualize real-time hardware metrics including CPU temperature, RAM usage, light sensors, accelerometer data, and battery statistics.

Perfect for:
- 📊 **IoT Prototyping** - Rapid sensor data visualization
- 🎓 **Educational Projects** - Learn SCADA systems and real-time data streaming
- 🎨 **UI/UX Showcases** - Demonstrate advanced animation and design patterns
- 🔬 **Hardware Monitoring** - Track Android device performance metrics

---

## ✨ Features

### 🎭 Cinematic User Interface
- **Holographic Effects** - Glassmorphism and neon accents
- **Smooth Animations** - Powered by Framer Motion
- **Boot Sequence** - Authentic system initialization with login
- **Component Health Monitoring** - Visual status indicators with failure simulation
- **Disconnection Handling** - Graceful error states with reconnection prompts

### 📱 Real-Time Sensor Monitoring
- **CPU Temperature** - Multi-zone thermal monitoring
- **CPU Usage** - Live processor load tracking
- **RAM Usage** - Memory consumption metrics
- **Light Sensor** - Ambient light detection (Lux)
- **Accelerometer** - Vibration and motion detection
- **Battery Stats** - Level and temperature monitoring

### 🏗️ System Architecture
- **Orbital Sensor Display** - 6-node radial visualization
- **Metric Cards** - Component-based health tracking
- **System Topology** - Network graph visualization
- **Real-time Updates** - WebSocket-ready architecture (polling-based)

---

## 🎬 Demo

### System Boot Sequence
The dashboard features an authentic boot sequence with:
- System initialization logs
- Component health checks
- User authentication
- Smooth transitions to main interface

### Live Sensor Dashboard
- Real-time sensor data updates every 500ms
- Responsive orbital visualization
- Color-coded status indicators (Normal/Warning/Critical)
- Smooth value transitions and animations

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Android Device** with USB debugging enabled
- **ADB (Android Debug Bridge)** installed
  - Windows: Download [Android SDK Platform Tools](https://developer.android.com/studio/releases/platform-tools)
  - macOS: `brew install android-platform-tools`
  - Linux: `sudo apt-get install android-tools-adb`

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Exan2/phone-sensor-scada.git
   cd phone-sensor-scada
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../phone-sensor-service
   npm install
   ```

3. **Enable USB Debugging on Android**
   - Go to `Settings` → `About Phone`
   - Tap `Build Number` 7 times to enable Developer Options
   - Go to `Settings` → `Developer Options`
   - Enable `USB Debugging`

4. **Connect your Android device**
   ```bash
   # Verify ADB connection
   adb devices
   # You should see your device listed
   ```

5. **Start the services**

   **Terminal 1 - Backend Service:**
   ```bash
   cd phone-sensor-service
   npm start
   ```

   **Terminal 2 - Frontend Dashboard:**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the dashboard**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📖 Usage

### First Launch

1. **Boot Sequence** - Watch the system initialization
2. **Login** - Enter credentials (default: any username/password)
3. **Dashboard** - View real-time sensor data from your Android device

### Interacting with the Dashboard

- **Sensor Nodes** - Hover over orbital nodes to see detailed metrics
- **Metric Cards** - Monitor component health (CORE, NETWORK, STORAGE, POWER)
- **System Actions** - Use the control panel to simulate failures/restarts
- **Disconnect Handling** - Unplug your device to see the disconnection overlay

### Troubleshooting

**Device not detected?**
- Ensure USB debugging is enabled
- Check ADB connection: `adb devices`
- Try a different USB cable or port
- Authorize the computer on your phone when prompted

**Sensors showing 0 or null?**
- Some sensors may not be available on all devices
- Check backend logs for parsing errors
- Use debug endpoint: `http://localhost:3001/api/debug`

**Frontend not updating?**
- Verify backend is running on port 3001
- Check browser console for errors
- Ensure CORS is not blocking requests

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Icon system

### Backend
- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[Express](https://expressjs.com/)** - Web framework
- **[ADB](https://developer.android.com/studio/command-line/adb)** - Android Debug Bridge

### Architecture
```
┌─────────────────┐      HTTP/REST      ┌──────────────────┐
│                 │ ◄─────────────────► │                  │
│  Next.js Client │                     │  Express Server  │
│   (Port 3000)   │                     │   (Port 3001)    │
│                 │                     │                  │
└─────────────────┘                     └────────┬─────────┘
                                                 │
                                                 │ ADB
                                                 │
                                        ┌────────▼─────────┐
                                        │                  │
                                        │  Android Device  │
                                        │    (Sensors)     │
                                        │                  │
                                        └──────────────────┘
```

---

## 📁 Project Structure

```
phone-sensor-scada/
├── client/                      # Next.js frontend
│   ├── app/                     # App router pages
│   ├── components/
│   │   └── scada/              # SCADA UI components
│   │       ├── center-map.tsx  # Orbital sensor display
│   │       ├── metric-card.tsx # Component health cards
│   │       ├── system-boot-overlay.tsx
│   │       └── ...
│   ├── types/                  # TypeScript definitions
│   └── package.json
│
├── phone-sensor-service/       # Node.js backend
│   ├── index.js               # Express server + ADB bridge
│   └── package.json
│
└── README.md
```

---

## 🎨 Customization

### Modify Sensor Polling Rate
Edit `client/app/page.tsx`:
```typescript
// Change from 500ms to your preferred interval
const interval = setInterval(fetchSensorData, 500);
```

### Add New Sensors
1. Update backend (`phone-sensor-service/index.js`) to read new sensor
2. Add field to `SensorData` interface (`client/types/sensor.ts`)
3. Update UI components to display new data

### Customize Theme
Edit Tailwind config or component styles in `client/components/scada/`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

##  Acknowledgments

- Inspired by industrial SCADA systems and sci-fi interfaces
- Built with modern web technologies and Android debugging tools
- Special thanks to the open-source community

