'use client';

import { useState, useEffect } from 'react';

// Client-side only time component to avoid hydration errors
function ClientTime() {
  const [time, setTime] = useState<string>('');
  
  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return <span>Updated: {time || '--:--:--'}</span>;
}

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  min: number;
  max: number;
  current: number;
  isAlarming?: boolean;
  min_value?: number;
  max_value?: number;
  avg_value?: number;
  trend?: 'up' | 'down' | 'stable';
  health?: number;
}

export function MetricCard({
  label,
  value,
  unit,
  status,
  min,
  max,
  current,
  isAlarming = false,
  min_value,
  max_value,
  avg_value,
  trend = 'stable',
  health = 100,
}: MetricCardProps) {
  const statusColors = {
    normal: 'border-scada-green text-scada-green shadow-glow-green',
    warning: 'border-scada-yellow text-scada-yellow shadow-glow-yellow',
    critical: 'border-scada-red text-scada-red shadow-glow-red',
  };

  const percentage = ((current - min) / (max - min)) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? 'text-scada-red' : trend === 'down' ? 'text-scada-green' : 'text-scada-cyan';

  return (
    <div 
      className={`p-3 border-l-4 bg-black/40 backdrop-blur-sm relative ${statusColors[status]} border transition-all ${
        isAlarming ? 'animate-pulse' : ''
      }`}
    >
      {/* Scanline overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 136, 0.1) 25%, rgba(0, 255, 136, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 136, 0.1) 75%, rgba(0, 255, 136, 0.1) 76%, transparent 77%, transparent)',
          backgroundSize: '100% 4px',
          animation: 'scanlines 8s linear infinite',
        }}
      />

      <div className="relative z-10">
        {/* Header with label and status indicator */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xs font-mono uppercase tracking-wider">{label}</h3>
          <div className="flex items-center gap-1">
            <div 
              className={`w-2 h-2 ${status === 'normal' ? 'bg-scada-green' : status === 'warning' ? 'bg-scada-yellow' : 'bg-scada-red'}`}
              style={{ animation: status === 'normal' ? 'none' : 'pulse 1s infinite' }}
            />
            <span className="text-xs">{status.toUpperCase()}</span>
          </div>
        </div>
        
        {/* Main value display */}
        <div className="mb-2 flex justify-between items-baseline">
          <div>
            <span className="text-lg font-bold font-mono">{value.toFixed(1)}</span>
            <span className="text-xs ml-1">{unit}</span>
          </div>
          <span className={`text-xs font-mono ${trendColor}`}>{trendIcon} {trend.toUpperCase()}</span>
        </div>

        {/* Radial gauge SVG */}
        <svg viewBox="0 0 100 60" className="w-full h-12 mb-2">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="rgba(0, 255, 136, 0.2)"
            strokeWidth="2"
          />
          
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={status === 'normal' ? '#00ff88' : status === 'warning' ? '#ffcc00' : '#ff0000'}
            strokeWidth="3"
            strokeDasharray={`${(clampedPercentage / 100) * 251} 251`}
            style={{ transition: 'stroke-dasharray 0.3s ease' }}
            opacity="0.9"
            filter="drop-shadow(0 0 6px currentColor)"
          />
          
          <line
            x1="50"
            y1="50"
            x2={50 + 30 * Math.cos((clampedPercentage / 100) * Math.PI - Math.PI)}
            y2={50 - 30 * Math.sin((clampedPercentage / 100) * Math.PI - Math.PI)}
            stroke={status === 'normal' ? '#00ff88' : status === 'warning' ? '#ffcc00' : '#ff0000'}
            strokeWidth="2"
            opacity="0.9"
            filter="drop-shadow(0 0 4px currentColor)"
          />
          
          <circle cx="50" cy="50" r="3" fill={status === 'normal' ? '#00ff88' : status === 'warning' ? '#ffcc00' : '#ff0000'} opacity="0.8" />
        </svg>

        {/* Min/Max/Avg display */}
        <div className="text-xs font-mono space-y-1 mb-2">
          <div className="flex justify-between px-2 opacity-60">
            <span>MIN</span>
            <span>AVG</span>
            <span>MAX</span>
          </div>
          <div className="flex justify-between px-2 opacity-80 text-scada-cyan">
            <span>{(min_value ?? min).toFixed(1)}</span>
            <span>{(avg_value ?? ((min + max) / 2)).toFixed(1)}</span>
            <span>{(max_value ?? max).toFixed(1)}</span>
          </div>
        </div>

        {/* Health percentage bar */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono opacity-60">HEALTH:</span>
          <div className="flex-1 h-1.5 bg-black/50 border border-scada-green/30 overflow-hidden">
            <div 
              className="h-full transition-all duration-300"
              style={{
                width: `${health}%`,
                backgroundColor: health > 70 ? '#00ff88' : health > 40 ? '#ffcc00' : '#ff0000',
              }}
            />
          </div>
          <span className="text-xs font-mono w-8 text-right">{health.toFixed(0)}%</span>
        </div>

        {/* Last update timestamp - client-side only to avoid hydration error */}
        <div className="text-xs font-mono opacity-50 text-center">
          <ClientTime />
        </div>
      </div>
    </div>
  );
}
