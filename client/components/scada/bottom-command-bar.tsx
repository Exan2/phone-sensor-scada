'use client';

import { useEffect, useState } from 'react';

interface BottomCommandBarProps {
  command: string;
  setCommand: (cmd: string) => void;
  onSubmit: (cmd: string) => void;
}

export function BottomCommandBar({ command, setCommand, onSubmit }: BottomCommandBarProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const availableCommands = [
    'scan all',
    'system status',
    'diagnostic --full',
    'enable monitoring',
    'disable alerts',
    'reset node temp',
    'shutdown core',
  ];

  useEffect(() => {
    if (command.length > 0) {
      setSuggestions(
        availableCommands.filter((cmd) => cmd.toLowerCase().startsWith(command.toLowerCase()))
      );
    } else {
      setSuggestions([]);
    }
  }, [command]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (suggestions.length > 0 && command !== suggestions[0]) {
        setCommand(suggestions[0]);
      } else {
        onSubmit(command);
        setCommand('');
        setSuggestions([]);
      }
    }
    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      setCommand(suggestions[0]);
      setSuggestions([]);
    }
  };

  return (
    <div className="relative h-full flex flex-col justify-center px-4">
      {/* Suggestion popup */}
      {suggestions.length > 0 && (
        <div 
          className="absolute bottom-12 left-4 bg-black/90 border border-scada-purple/50 min-w-60"
          style={{ animation: 'fadeIn 0.2s ease-in' }}
        >
          {suggestions.slice(0, 5).map((suggestion, i) => (
            <div
              key={i}
              className="px-3 py-2 text-xs font-mono text-scada-purple hover:bg-scada-purple/20 cursor-pointer border-b border-scada-purple/20 last:border-b-0 transition-colors"
              onClick={() => {
                setCommand(suggestion);
                setSuggestions([]);
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-scada-purple">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command..."
          className="flex-1 bg-transparent border-b border-scada-purple text-xs font-mono text-scada-purple placeholder-scada-purple/50 focus:outline-none"
          style={{
            textShadow: '0 0 10px rgba(180, 100, 255, 0.5)',
          }}
        />
        <span 
          className="text-xs text-scada-purple/50"
          style={{ animation: 'blink 0.5s infinite' }}
        >
          ▌
        </span>
      </div>
    </div>
  );
}
