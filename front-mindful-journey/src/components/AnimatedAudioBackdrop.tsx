import React, { useMemo } from 'react';

interface AnimatedAudioBackdropProps {
  active?: boolean;
  petals?: number;
  intensity?: number; // 0..1
}

const AnimatedAudioBackdrop: React.FC<AnimatedAudioBackdropProps> = ({ active = false, petals = 18, intensity = 0.6 }) => {
  const items = useMemo(() => Array.from({ length: petals }), [petals]);
  const opacity = active ? intensity : 0; 
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none select-none" aria-hidden="true">
      <div className="absolute inset-0 animate-[gradientShift_12s_linear_infinite] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),rgba(255,255,255,0)_60%),linear-gradient(135deg,#4f46e5_0%,#8b5cf6_40%,#ec4899_70%,#fbbf24_100%)] mix-blend-overlay" style={{ opacity }} />
      {items.map((_, i) => {
        const delay = `${(i * 0.35).toFixed(2)}s`;
        const size = 120 + (i % 5) * 35;
        const left = `${(i * 57) % 100}%`;
        const duration = 18 + (i % 7) * 4;
        return (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-white/20 to-white/5 blur-2xl animate-[floatPetal_var(--d)_ease-in-out_infinite]"
            style={{
              width: size,
              height: size,
              left,
              top: `${(i * 37) % 100}%`,
              animationDelay: delay,
              ['--d' as any]: `${duration}s`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

export default AnimatedAudioBackdrop;
