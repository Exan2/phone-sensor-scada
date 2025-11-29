'use client';

import { useEffect, useRef, useState } from 'react';
import type { LogEntry } from '@/hooks/use-event-log';

// Client-side only time component to avoid hydration errors
function TerminalEventLine({ event, getLevelColor }: { event: { text: string; fullText: string; level: LogEntry['level'] }, getLevelColor: (level: LogEntry['level']) => string }) {
  const [time, setTime] = useState<string>('');
  
  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div 
      className="break-words"
      style={{ animation: `fadeIn 0.3s ease-in` }}
    >
      <span className="text-scada-cyan">[{time || '--:--:--'}]</span>
      <span className={`font-bold ${getLevelColor(event.level)}`}>
        {' '}[{event.level}]
      </span>
      <span className="text-scada-green">
        {' '}{event.text}
      </span>
      {event.text.length < event.fullText.length && (
        <span style={{ animation: 'blink 1s infinite' }}>▌</span>
      )}
    </div>
  );
}

interface RightTerminalProps {
  events: LogEntry[];
  isAlarming?: boolean;
}

export function RightTerminal({ events, isAlarming = false }: RightTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [displayedEvents, setDisplayedEvents] = useState<Array<{ text: string; fullText: string; level: LogEntry['level'] }>>([]);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  useEffect(() => {
    const lastEvent = events[events.length - 1];
    if (!lastEvent) return;

    const lastDisplayed = displayedEvents[displayedEvents.length - 1]?.fullText;
    if (lastDisplayed === lastEvent.message) return;

    const newEvents = events.slice(Math.max(0, events.length - 20));
    setDisplayedEvents(newEvents.map(e => ({ text: '', fullText: e.message, level: e.level })));

    let eventIndex = 0;
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (eventIndex >= newEvents.length) {
        clearInterval(typeInterval);
        return;
      }

      const currentEvent = newEvents[eventIndex];
      charIndex = Math.min(charIndex + 2, currentEvent.message.length);

      setDisplayedEvents(prev => {
        const updated = [...prev];
        updated[eventIndex] = {
          ...updated[eventIndex],
          text: currentEvent.message.substring(0, charIndex)
        };
        return updated;
      });

      if (charIndex >= currentEvent.message.length) {
        eventIndex++;
        charIndex = 0;
      }
    }, 10);

    return () => clearInterval(typeInterval);
  }, [events, displayedEvents]);

  useEffect(() => {
    if (terminalRef.current && !isScrolledUp) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedEvents, isScrolledUp]);

  const handleScroll = () => {
    if (terminalRef.current) {
      const isAtBottom = Math.abs(
        terminalRef.current.scrollHeight - terminalRef.current.clientHeight - terminalRef.current.scrollTop
      ) < 10;
      setIsScrolledUp(!isAtBottom);
    }
  };

  const getLevelColor = (level: LogEntry['level']): string => {
    switch (level) {
      case 'CRITICAL':
        return 'text-scada-red';
      case 'WARN':
        return 'text-scada-yellow';
      case 'SYSTEM':
        return 'text-scada-cyan';
      case 'USER':
        return 'text-scada-purple';
      default:
        return 'text-scada-green';
    }
  };

  return (
    <div 
      className={`h-full flex flex-col gap-2 pb-20 transition-all duration-300 ${
        isAlarming 
          ? 'border-l-2 border-scada-red shadow-glow-red' 
          : 'border-l-2 border-scada-cyan shadow-glow-green'
      }`}
      style={isAlarming ? { animation: 'pulse 1s infinite' } : {}}
    >
      <div className="px-3 py-2 border-l-4 border-scada-green flex justify-between items-center">
        <h2 className="text-xs font-mono uppercase tracking-widest text-scada-green">
          ▸ Terminal / Event Log
        </h2>
        {isScrolledUp && (
          <button
            onClick={() => {
              if (terminalRef.current) {
                terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
                setIsScrolledUp(false);
              }
            }}
            className="text-xs font-mono text-scada-cyan hover:text-scada-green transition-colors"
          >
            ↓ SCROLL TO BOTTOM
          </button>
        )}
      </div>

      <div
        ref={terminalRef}
        className="flex-1 border border-scada-green/30 bg-black/60 backdrop-blur-sm overflow-y-auto font-mono text-xs p-3 space-y-1"
        onScroll={handleScroll}
        style={{
          color: '#00ff88',
          textShadow: isAlarming 
            ? '0 0 20px rgba(255, 0, 0, 0.6)' 
            : '0 0 10px rgba(0, 255, 136, 0.5)',
        }}
      >
        {displayedEvents.length === 0 ? (
          <div className="text-scada-green/50">[--:--:--] Initializing system...</div>
        ) : (
          displayedEvents.map((event, i) => (
            <TerminalEventLine key={i} event={event} getLevelColor={getLevelColor} />
          ))
        )}
      </div>
    </div>
  );
}
