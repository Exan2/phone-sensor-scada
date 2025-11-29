'use client';

import { useState, useEffect, useRef } from 'react';

interface PasswordModalProps {
    title: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function PasswordModal({ title, onSuccess, onCancel }: PasswordModalProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin') {
            onSuccess();
        } else {
            setError(true);
            setPassword('');
            setTimeout(() => setError(false), 1000);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className={`w-96 bg-scada-dark border-2 ${error ? 'border-scada-red animate-shake' : 'border-scada-cyan'} p-6 shadow-2xl relative`}>
                <h2 className={`text-xl font-mono font-bold mb-6 text-center tracking-widest ${error ? 'text-scada-red' : 'text-scada-cyan'}`}>
                    {error ? 'ACCESS DENIED' : title}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-mono uppercase tracking-widest mb-2 text-scada-text/50">
                            Enter Authorization Code
                        </label>
                        <input
                            ref={inputRef}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full bg-black/50 border-b-2 ${error ? 'border-scada-red text-scada-red' : 'border-scada-cyan text-scada-cyan'} py-2 text-center text-xl focus:outline-none transition-colors font-bold tracking-[0.5em]`}
                            placeholder="••••"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-2 border border-scada-text/30 text-scada-text/70 hover:bg-scada-text/10 font-mono text-xs uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 py-2 border ${error ? 'border-scada-red text-scada-red' : 'border-scada-cyan text-scada-cyan hover:bg-scada-cyan/10'} font-mono text-xs uppercase tracking-widest font-bold`}
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
