import React, { useEffect, useRef, useState } from 'react';

// Polyfill requestIdleCallback pour Safari/iOS
const requestIdleCallbackPolyfill = 
  typeof window !== 'undefined' && 'requestIdleCallback' in window 
    ? window.requestIdleCallback 
    : (cb: () => void) => setTimeout(cb, 1);

interface DynamicAudioBackdropProps {
  playing: boolean;            // audio en cours (avance le diaporama)
  paused?: boolean;            // audio en pause (on fige l'image courante)
  images?: string[];
  intervalMs?: number;       // temps entre deux images
  fadeDurationMs?: number;   // durée de la transition
  darkOverlayOpacity?: number; // opacité du voile foncé
  className?: string; // classes supplémentaires / override
}

// Composant léger qui fait défiler des images avec fondu enchaîné lorsqu'un audio est en lecture.
// Aucun event interactif; purement décoratif, pointer-events: none.
const DynamicAudioBackdrop: React.FC<DynamicAudioBackdropProps> = ({
  playing,
  paused = false,
  images,
  intervalMs = 6000,
  fadeDurationMs = 1200,
  darkOverlayOpacity = 0.45,
  className = '',
}) => {
  const defaultImages = images && images.length > 0 ? images : Array.from({ length: 37 }, (_, i) => i === 0 ? null : `/visuals/annual/step${i}.jpg`).filter(Boolean) as string[];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const preloadedRef = useRef<Set<string>>(new Set());

  // Précharger progressivement les images (lazy, pour ne pas geler le thread principal).
  useEffect(() => {
    if (!(playing || paused)) return; // ne précharge que si on a besoin d'afficher
    let cancelled = false;
    const queue = [...defaultImages];
    const loadNext = () => {
      if (cancelled) return;
      const src = queue.shift();
      if (!src) return;
      if (preloadedRef.current.has(src)) {
        requestIdleCallbackPolyfill(loadNext);
        return;
      }
      const img = new Image();
      img.onload = () => {
        preloadedRef.current.add(src);
        requestIdleCallbackPolyfill(loadNext);
      };
      img.onerror = () => requestIdleCallbackPolyfill(loadNext);
      img.src = src;
    };
    requestIdleCallbackPolyfill(loadNext);
    return () => { cancelled = true; };
  }, [playing, defaultImages]);

  // Avancer le diaporama quand playing = true.
  const effectivePlaying = playing && !paused;
  useEffect(() => {
    if (!effectivePlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (timerRef.current) return; // déjà lancé
    timerRef.current = window.setInterval(() => {
      setPrevIndex(ci => ci === null ? 0 : currentIndex);
      setCurrentIndex(ci => (ci + 1) % defaultImages.length);
    }, intervalMs) as unknown as number;
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [effectivePlaying, defaultImages.length, intervalMs, currentIndex]);

  // Reset indices lorsqu'on arrête la lecture.
  useEffect(() => {
    if (!playing && !paused) { // arrêt complet
      setPrevIndex(null);
      setCurrentIndex(0);
    }
  }, [playing, paused]);
  const active = playing || paused;
  if (!active || defaultImages.length === 0) return null;

  const current = defaultImages[currentIndex];
  const previous = prevIndex != null ? defaultImages[prevIndex] : null;

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 z-0 overflow-hidden ${className}`}
      style={{ background: '#000' }}
    >
      {/* Images superposées */}
      {previous && (
        <img
          key={previous + '-prev'}
          src={previous}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transform scale-105 transition-opacity"
          style={{
            opacity: 0,
            transition: `opacity ${fadeDurationMs}ms ease-in-out`,
          }}
        />
      )}
      {current && (
        <img
          key={current + '-curr'}
          src={current}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transform scale-105 fade-active"
          style={{
            opacity: 1,
            animation: `daZoom ${intervalMs + fadeDurationMs}ms linear infinite`,
            animationPlayState: paused ? 'paused' : 'running',
            filter: paused ? 'grayscale(30%) brightness(0.85)' : 'none',
            transition: `opacity ${fadeDurationMs}ms ease-in-out`,
          }}
        />
      )}
      {/* Voile sombre pour lisibilité */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(rgba(0,0,0,${darkOverlayOpacity}), rgba(0,0,0,${darkOverlayOpacity+0.05}))` }}
      />
      <style>{`
        @keyframes daZoom { 
          0% { transform: scale(1.05); }
          100% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
};

export default DynamicAudioBackdrop;
