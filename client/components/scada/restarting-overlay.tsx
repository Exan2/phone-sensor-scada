'use client';

export function RestartingOverlay() {
    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center font-mono text-scada-cyan">
            <div className="text-4xl font-bold tracking-widest animate-pulse mb-8">
                SYSTEM RESTARTING
            </div>

            <div className="w-64 h-2 bg-scada-dark border border-scada-cyan/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-scada-cyan/50 animate-[shimmer_1s_infinite_linear]" />
            </div>

            <div className="mt-4 text-xs text-scada-text/70 uppercase tracking-widest">
                Stopping Services...
            </div>

            {/* Scanlines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                    backgroundSize: '100% 2px, 3px 100%'
                }}
            />
        </div>
    );
}
