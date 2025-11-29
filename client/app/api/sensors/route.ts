import { NextResponse } from 'next/server';

const SENSOR_SERVICE_URL = process.env.SENSOR_SERVICE_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const response = await fetch(`${SENSOR_SERVICE_URL}/api/sensors`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If service is not available, return error
      if (response.status === 503) {
        console.log('📱 API: Phone sensor service returned 503 - Phone not connected');
        return NextResponse.json({
          error: 'Phone not connected',
          message: 'Using mock data. Connect your phone to enable real sensor data.',
          mock: true,
        }, { status: 503 });
      }
      throw new Error(`Sensor service error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Log successful sensor data fetch for verification
    if (data && !data.error) {
      console.log('✅ API: Real sensor data fetched successfully:', {
        temperature: data.temperature,
        humidity: data.humidity,
        batteryLevel: data.batteryLevel,
        batteryTemp: data.batteryTemp,
        timestamp: data.timestamp || new Date().toISOString()
      });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    // Return error but allow frontend to handle fallback
    console.error('❌ API: Sensor service unavailable:', error.message);
    return NextResponse.json({
      error: 'Sensor service unavailable',
      message: error.message || 'Cannot connect to phone sensor service',
      mock: true,
    }, { status: 503 });
  }
}

