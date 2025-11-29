# Phone Sensor Service

This service reads real sensor data from your Android phone (Realme 7 Pro) via USB/ADB and provides it to the SCADA dashboard.

## Prerequisites

1. **Install ADB (Android Debug Bridge)**
   - Download from: https://developer.android.com/studio/releases/platform-tools
   - Or install via package manager:
     - Windows: `choco install adb` or download from Google
     - Mac: `brew install android-platform-tools`
     - Linux: `sudo apt-get install android-tools-adb`

2. **Enable USB Debugging on Your Phone**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
   - Enable "USB Debugging (Security settings)" if available

3. **Connect Your Phone**
   - Connect phone to PC via USB cable
   - Select "File Transfer" or "MTP" mode when prompted
   - On your phone, when prompted "Allow USB debugging?", tap "Allow" and check "Always allow from this computer"

## Installation

```bash
cd phone-sensor-service
npm install
```

## Running the Service

```bash
npm start
```

The service will run on `http://localhost:3001`

## Testing Connection

1. Check if ADB detects your device:
   ```bash
   adb devices
   ```
   You should see your device listed.

2. Test the service:
   ```bash
   curl http://localhost:3001/api/health
   ```

3. Get sensor data:
   ```bash
   curl http://localhost:3001/api/sensors
   ```

## Sensor Mapping

The service maps your phone's sensors to SCADA metrics:

- **Temperature**: Battery temperature or CPU temperature
- **Humidity**: Battery level (0-100%) as proxy
- **Pressure**: Atmospheric pressure sensor (if available)
- **Vibration**: Calculated from accelerometer data
- **Load**: Inverse of battery level (100 - battery%)

## Troubleshooting

**Device not detected:**
- Make sure USB debugging is enabled
- Try different USB cable
- Try different USB port
- Run `adb kill-server` then `adb start-server`
- Check if device appears in `adb devices`

**Permission denied:**
- Make sure you authorized the computer on your phone
- Revoke USB debugging authorizations and reconnect

**No sensor data:**
- Some sensors may require root access
- Battery temperature should work without root
- Check `adb shell dumpsys battery` to verify battery data

