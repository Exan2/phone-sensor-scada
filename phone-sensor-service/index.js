const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Find ADB executable path
function getADBPath() {
  const commonPaths = [
    'adb', // In PATH
    'C:\\Users\\compt\\AppData\\Local\\Android\\Sdk\\platform-tools\\adb.exe', // Prioritize known path
    'C:\\adb\\adb.exe',
    'C:\\Program Files\\Android\\android-sdk\\platform-tools\\adb.exe',
    process.env.ANDROID_HOME ? `${process.env.ANDROID_HOME}\\platform-tools\\adb.exe` : null,
    process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe` : null,
  ].filter(Boolean);

  // Try to find ADB
  for (const path of commonPaths) {
    try {
      const { execSync } = require('child_process');
      if (path === 'adb') {
        execSync('adb version', { stdio: 'ignore' });
        return 'adb';
      } else {
        const fs = require('fs');
        if (fs.existsSync(path)) {
          return path;
        }
      }
    } catch (e) {
      continue;
    }
  }
  return 'adb'; // Fallback
}

// Check if ADB is available and device is connected
async function checkADBConnection() {
  try {
    const adbPath = getADBPath();
    const command = adbPath === 'adb' ? 'adb devices' : `"${adbPath}" devices`;
    const { stdout } = await execAsync(command);

    // Parse device list - format: "device_id\tdevice"
    const lines = stdout.split('\n');
    const devices = lines
      .filter(line => {
        const trimmed = line.trim();
        return trimmed &&
          !trimmed.includes('List of devices') &&
          !trimmed.includes('daemon') &&
          trimmed.includes('\t') &&
          trimmed.includes('device');
      })
      .map(line => {
        const parts = line.trim().split(/\s+/);
        return parts[0]; // Get device ID
      })
      .filter(id => id && id.length >= 4); // Device IDs are at least 4 chars

    const isConnected = devices.length > 0;
    if (isConnected) {
      // console.log(`✅ Device detected: ${devices.join(', ')}`);
    } else {
      console.log('⚠️  No devices found');
    }

    return isConnected;
  } catch (error) {
    console.error('ADB connection check error:', error.message);
    return false;
  }
}

// Read battery temperature (available on most Android devices)
async function readBatteryTemperature() {
  try {
    const adbPath = getADBPath();
    const { stdout } = await execAsync(`"${adbPath}" shell dumpsys battery`);
    const match = stdout.match(/temperature: (\d+)/);
    if (match) {
      // Battery temperature is in tenths of a degree Celsius
      return parseFloat(match[1]) / 10;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Read battery level
async function readBatteryLevel() {
  try {
    const adbPath = getADBPath();
    const { stdout } = await execAsync(`"${adbPath}" shell dumpsys battery`);
    const match = stdout.match(/level: (\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Read CPU Temperature from multiple thermal zones
async function readCpuTemperature() {
  try {
    const adbPath = getADBPath();
    // Try to read from multiple thermal zones and find the highest realistic value
    const { stdout } = await execAsync(`"${adbPath}" shell "cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null"`);

    const temps = stdout.split('\n')
      .map(t => parseFloat(t.trim()))
      .filter(t => !isNaN(t) && t > 0);

    if (temps.length === 0) return null;

    // Normalize temps (some are in C, some in mC)
    const normalizedTemps = temps.map(t => t > 1000 ? t / 1000 : t);

    // Filter for realistic CPU temps (20C to 100C)
    const validTemps = normalizedTemps.filter(t => t >= 20 && t <= 100);

    if (validTemps.length > 0) {
      // Return the max temp found (usually the hottest core)
      return Math.max(...validTemps);
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Read CPU Usage
async function readCpuUsage() {
  try {
    const adbPath = getADBPath();
    // Try top first as it's more standard
    // -n 1: one iteration, -m 5: max 5 processes (we just want header)
    const { stdout } = await execAsync(`"${adbPath}" shell "top -n 1 -m 1"`);

    // Parse top output: "User 5%, System 2%, IOW 0%, IRQ 0%" or "400%cpu 12%user 0%nice 15%sys"

    // Pattern 1: "User 5%, System 2%"
    let user = 0, sys = 0;
    const userMatch = stdout.match(/User (\d+)%/i);
    const sysMatch = stdout.match(/System (\d+)%/i);

    if (userMatch || sysMatch) {
      if (userMatch) user = parseInt(userMatch[1]);
      if (sysMatch) sys = parseInt(sysMatch[1]);
      return user + sys;
    }

    // Pattern 2: "800%cpu 10%user 0%nice 32%sys"
    // We want to sum user + sys
    const userPercentMatch = stdout.match(/(\d+)%user/i);
    const sysPercentMatch = stdout.match(/(\d+)%sys/i);

    if (userPercentMatch || sysPercentMatch) {
      let u = userPercentMatch ? parseInt(userPercentMatch[1]) : 0;
      let s = sysPercentMatch ? parseInt(sysPercentMatch[1]) : 0;
      return u + s;
    }

    // Fallback: dumpsys cpuinfo
    const { stdout: dump } = await execAsync(`"${adbPath}" shell dumpsys cpuinfo | grep "Load"`);
    if (dump && dump.includes('Load')) {
      const match = dump.match(/Load:\s*([\d.]+)/);
      if (match) return parseFloat(match[1]);
    }

    return null;
  } catch (error) {
    console.error('Error reading CPU usage:', error.message);
    return null;
  }
}

// Read RAM Usage
async function readRamUsage() {
  try {
    const adbPath = getADBPath();
    // Try /proc/meminfo first
    const { stdout } = await execAsync(`"${adbPath}" shell "cat /proc/meminfo"`);

    const totalMatch = stdout.match(/MemTotal:\s*(\d+)\s*kB/);
    const freeMatch = stdout.match(/MemFree:\s*(\d+)\s*kB/);
    const availableMatch = stdout.match(/MemAvailable:\s*(\d+)\s*kB/);

    if (totalMatch) {
      const total = parseInt(totalMatch[1]);
      let used = 0;

      if (availableMatch) {
        const available = parseInt(availableMatch[1]);
        used = total - available;
      } else if (freeMatch) {
        const free = parseInt(freeMatch[1]);
        // This is rough, doesn't account for buffers/cache
        used = total - free;
      }

      return used / 1024; // MB
    }

    // Fallback: dumpsys meminfo
    const { stdout: dump } = await execAsync(`"${adbPath}" shell dumpsys meminfo | grep "Used RAM"`);
    const match = dump.match(/Used RAM:\s*([\d,]+)/);
    if (match) {
      return parseInt(match[1].replace(/,/g, '')) / 1024; // Convert to MB
    }

    return null;
  } catch (error) {
    console.error('Error reading RAM usage:', error.message);
    return null;
  }
}

// Read light sensor with improved parsing
async function readLightSensor() {
  try {
    const adbPath = getADBPath();
    // Read light sensor value from dumpsys
    // We grep for "Light" and get a larger chunk
    const { stdout } = await execAsync(`"${adbPath}" shell "dumpsys sensorservice | grep -i -A 50 'light'"`);

    const lines = stdout.split('\n');
    let foundLightSensor = false;
    let bestValue = null;

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('light') && lower.includes('sensor')) {
        foundLightSensor = true;
      }

      if (foundLightSensor) {
        // Pattern 1: "value: 123.45"
        const valueMatch = line.match(/value:\s*([0-9.]+)/i);
        if (valueMatch) {
          const val = parseFloat(valueMatch[1]);
          if (!isNaN(val)) return val;
        }

        // Pattern 2: "123.45 lux"
        const luxMatch = line.match(/([0-9.]+)\s*lux/i);
        if (luxMatch) {
          const val = parseFloat(luxMatch[1]);
          if (!isNaN(val)) return val;
        }

        // Pattern 3: Timestamped events "1 (ts=...) 0.00, 22.00, ..."
        // Match: (ts=...) followed by numbers
        const eventMatch = line.match(/\(ts=[^)]+\)\s*([0-9.-]+),\s*([0-9.-]+)/);
        if (eventMatch) {
          // Usually the first value is lux, but sometimes it's 0 if invalid
          // We'll take the first value, but if it's 0, we might check the second?
          // Actually, let's trust the first value if it's reasonable, or keep looking for a non-zero one
          const val1 = parseFloat(eventMatch[1]);

          if (!isNaN(val1)) {
            if (bestValue === null || (bestValue === 0 && val1 > 0)) {
              bestValue = val1;
            }
          }
        }

        // Pattern 4: CSV style "123.45, 0.0, 0.0" (start of line)
        if (line.trim().match(/^\d+\.\d+,\s*[-.\d]+,\s*[-.\d]+/)) {
          const parts = line.trim().split(',');
          const val = parseFloat(parts[0]);
          if (!isNaN(val)) {
            if (bestValue === null || (bestValue === 0 && val > 0)) {
              bestValue = val;
            }
          }
        }
      }
    }

    return bestValue;
  } catch (error) {
    console.error('Error reading light sensor:', error.message);
    return null;
  }
}

// Get device motion/vibration using accelerometer magnitude
let lastAccelData = { x: 0, y: 0, z: 0 };
let accelHistory = [];
let lastVibration = 0;
let initialized = false;

async function getVibration() {
  try {
    const adbPath = getADBPath();

    // Read accelerometer from dumpsys sensorservice - get the last event
    try {
      // Use a simpler command that works better on Windows
      // Get accelerometer events - try multiple approaches
      let stdout = '';
      try {
        // Method 1: Direct dumpsys with grep
        const result = await execAsync(`"${adbPath}" shell "dumpsys sensorservice | grep -A 50 'bmi160 Accelerometer.*last.*events'"`);
        stdout = result.stdout;
      } catch (e1) {
        // Method 2: Get full dumpsys and parse in Node
        try {
          const result = await execAsync(`"${adbPath}" shell dumpsys sensorservice`);
          stdout = result.stdout;
        } catch (e2) {
          // console.error('Failed to read sensorservice:', e2.message);
          return lastVibration > 0 ? lastVibration * 0.95 : 0.1;
        }
      }

      let x, y, z;

      // Parse all lines to find accelerometer data
      const lines = stdout.split('\n');
      const accelReadings = [];

      // Find the section with accelerometer events
      let inAccelSection = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if we're entering the accelerometer events section
        // Relaxed matching to support more devices
        if ((line.includes('Accelerometer') || line.includes('accelerometer')) && line.includes('last') && line.includes('events')) {
          inAccelSection = true;
          continue;
        }

        // Stop if we hit another sensor section
        if (inAccelSection && line.trim().startsWith('>') && !line.toLowerCase().includes('accelerometer')) {
          break;
        }

        // Parse accelerometer data lines
        if (inAccelSection) {
          // Match format: "6 (ts=3316484.678198057, wall=20:06:59.099) 2.97, 6.78, 6.08,"
          // The pattern: number, timestamp in parens, then three numbers with commas
          let match = line.match(/\d+\s+\([^)]+\)\s+([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,?\s*$/);

          if (match && match.length >= 4) {
            const x = parseFloat(match[1]);
            const y = parseFloat(match[2]);
            const z = parseFloat(match[3]);
            if (!isNaN(x) && !isNaN(y) && !isNaN(z) &&
              Math.abs(x) < 50 && Math.abs(y) < 50 && Math.abs(z) < 50) { // Sanity check
              accelReadings.push({ x, y, z });
            }
          }
        }
      }

      // Get the most recent reading (last in array)
      if (accelReadings.length > 0) {
        const latest = accelReadings[accelReadings.length - 1];
        x = latest.x;
        y = latest.y;
        z = latest.z;
      }

      if (x !== undefined && y !== undefined && z !== undefined &&
        !isNaN(x) && !isNaN(y) && !isNaN(z)) {

        // Initialize on first reading
        if (!initialized) {
          lastAccelData = { x, y, z };
          initialized = true;
          return 0.1; // Return baseline on first read
        }

        // Calculate change from last reading (vibration = change in acceleration)
        const deltaX = Math.abs(x - lastAccelData.x);
        const deltaY = Math.abs(y - lastAccelData.y);
        const deltaZ = Math.abs(z - lastAccelData.z);
        const vibration = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

        // Also calculate magnitude of current acceleration (for detecting movement)
        const currentMagnitude = Math.sqrt(x * x + y * y + z * z);
        const lastMagnitude = Math.sqrt(lastAccelData.x * lastAccelData.x +
          lastAccelData.y * lastAccelData.y +
          lastAccelData.z * lastAccelData.z);
        const magnitudeChange = Math.abs(currentMagnitude - lastMagnitude);

        // Use the larger of the two changes (delta or magnitude change)
        const totalVibration = Math.max(vibration, magnitudeChange * 0.5);

        // Add threshold - ignore very small movements (below 0.15 m/s² change)
        if (totalVibration < 0.15) {
          // Very small movement - return baseline
          if (lastVibration > 0.2) {
            lastVibration *= 0.95; // Decay slowly
          } else {
            lastVibration = 0.1;
          }
          return lastVibration;
        }

        // Update last known values
        lastAccelData = { x, y, z };

        // Store in history for smoothing (keep last 5 readings for better smoothing)
        accelHistory.push(totalVibration);
        if (accelHistory.length > 5) {
          accelHistory.shift();
        }

        // Use weighted average - more smoothing for less sensitivity
        let avgVibration;
        if (accelHistory.length === 1) {
          avgVibration = accelHistory[0];
        } else if (accelHistory.length === 2) {
          avgVibration = accelHistory[1] * 0.6 + accelHistory[0] * 0.4;
        } else if (accelHistory.length === 3) {
          avgVibration = accelHistory[2] * 0.5 + accelHistory[1] * 0.3 + accelHistory[0] * 0.2;
        } else {
          // More smoothing with 5 readings
          avgVibration = accelHistory[accelHistory.length - 1] * 0.4 +
            accelHistory[accelHistory.length - 2] * 0.25 +
            accelHistory[accelHistory.length - 3] * 0.2 +
            accelHistory[accelHistory.length - 4] * 0.1 +
            accelHistory[accelHistory.length - 5] * 0.05;
        }

        // Normalize to 0-10 range with much reduced sensitivity
        const normalized = Math.min(10, Math.max(0, avgVibration * 0.5));
        lastVibration = normalized;

        return normalized;
      } else {
        // If parsing failed but we have last value, decay it slowly
        if (lastVibration > 0.1) {
          lastVibration *= 0.95; // Decay slowly
          return lastVibration;
        }
        return 0.1;
      }
    } catch (e) {
      // console.error('❌ Error reading accelerometer:', e.message);
      // If error but we have last value, decay it
      if (lastVibration > 0.1) {
        lastVibration *= 0.9;
        return lastVibration;
      }
      return 0.1;
    }

    // If no data available, return very low baseline
    return initialized ? (lastVibration > 0 ? lastVibration * 0.95 : 0.1) : 0.1;
  } catch (error) {
    // Return last known value or baseline
    return lastVibration > 0 ? lastVibration * 0.95 : 0.1;
  }
}

// Main function to read all sensors and map to SCADA format
async function readPhoneSensors() {
  const batteryTemp = await readBatteryTemperature();
  const batteryLevel = await readBatteryLevel();
  const cpuTemp = await readCpuTemperature();
  const cpuUsage = await readCpuUsage();
  const ramUsage = await readRamUsage();

  // Map phone sensors to SCADA metrics:
  // - Temperature: Use CPU temp if available, else Battery temp
  // - Humidity: Use Battery Level as proxy (common in SCADA demos for phones)
  // - Light: Real light sensor
  // - Vibration: Real accelerometer

  let temperature = 25; // Default
  if (cpuTemp !== null) {
    temperature = cpuTemp;
  } else if (batteryTemp !== null) {
    temperature = batteryTemp;
  }

  // Use battery level as "humidity" proxy (0-100 range)
  const humidity = batteryLevel !== null ? batteryLevel : 50;

  // Read light sensor
  let light = 0; // Default in lux
  const lightValue = await readLightSensor();
  if (lightValue !== null) {
    light = lightValue;
  } else {
    // Fallback: Try reading from alternative method or use default
    light = 100; // Default ambient light
  }

  // Calculate vibration from accelerometer (real-time)
  let vibration = await getVibration();
  if (vibration === null || vibration === undefined) {
    vibration = 0.1;
  }

  return {
    temperature: Math.max(20, Math.min(85, temperature)),
    humidity: Math.max(0, Math.min(100, humidity)),
    light: Math.max(0, Math.min(100000, light)), // Light in lux (0-100k range)
    vibration: Math.max(0, Math.min(10, vibration)),
    status: temperature > 65 || vibration > 5 ? 'warning' : 'normal',
    batteryLevel: batteryLevel,
    batteryTemp: batteryTemp,
    cpuTemp: cpuTemp,
    cpuUsage: cpuUsage,
    ramUsage: ramUsage,
    timestamp: new Date().toISOString()
  };
}

// API endpoint to get current sensor data
app.get('/api/sensors', async (req, res) => {
  try {
    const isConnected = await checkADBConnection();
    if (!isConnected) {
      return res.status(503).json({
        error: 'Phone not connected',
        message: 'Please connect your phone via USB and enable USB debugging'
      });
    }

    const sensorData = await readPhoneSensors();
    res.json(sensorData);
  } catch (error) {
    console.error('Error reading sensors:', error);
    res.status(500).json({
      error: 'Failed to read sensors',
      message: error.message
    });
  }
});

// Debug endpoint to inspect raw ADB output
app.get('/api/debug', async (req, res) => {
  try {
    const adbPath = getADBPath();
    const debugInfo = {};

    // Check connection
    const { stdout: devices } = await execAsync(`"${adbPath}" devices`);
    debugInfo.devices = devices.trim();

    // CPU Info
    try {
      const { stdout: cpu } = await execAsync(`"${adbPath}" shell dumpsys cpuinfo | grep "Load"`);
      debugInfo.cpuInfo = cpu.trim();
    } catch (e) { debugInfo.cpuInfo = e.message; }

    // Mem Info
    try {
      const { stdout: mem } = await execAsync(`"${adbPath}" shell dumpsys meminfo | grep "Used RAM"`);
      debugInfo.memInfo = mem.trim();
    } catch (e) { debugInfo.memInfo = e.message; }

    // Thermal Zones (List first 5)
    try {
      const { stdout: thermal } = await execAsync(`"${adbPath}" shell "cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null | head -n 5"`);
      debugInfo.thermal = thermal.trim();
    } catch (e) { debugInfo.thermal = e.message; }

    // Light Sensor (Raw dumpsys snippet)
    try {
      // Get a chunk of sensorservice around "Light"
      const { stdout: light } = await execAsync(`"${adbPath}" shell "dumpsys sensorservice | grep -i -A 10 'light'"`);
      debugInfo.lightRaw = light.trim().substring(0, 1000); // Limit size
    } catch (e) { debugInfo.lightRaw = e.message; }

    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const isConnected = await checkADBConnection();
  res.json({
    connected: isConnected,
    service: 'phone-sensor-service',
    status: isConnected ? 'ready' : 'waiting_for_device'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📱 Phone Sensor Service running on http://localhost:${PORT}`);
  console.log(`🔌 Waiting for Android device connection...`);
  console.log(`\nMake sure:`);
  console.log(`1. USB debugging is enabled on your phone`);
  console.log(`2. Phone is connected via USB`);
  console.log(`3. You've authorized the computer on your phone`);
  console.log(`\nTest connection: http://localhost:${PORT}/api/health`);
});
