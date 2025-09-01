import React, { useMemo, useState, useEffect } from 'react';

interface AudioVideoBackdropProps {
  active?: boolean;
  theme?: string; // 'mer' | 'foret' | 'ciel' | 'auto'
  seed?: string;
}

const videos: Record<string, string[]> = {
  mer: [
    '/visuals/mer1.mp4',
    '/visuals/mer2.mp4'
  ],
  foret: [
    '/visuals/foret1.mp4',
    '/visuals/foret2.mp4'
  ],
  ciel: [
    '/visuals/ciel1.mp4',
    '/visuals/ciel2.mp4'
  ]
};

const allThemes = ['mer','foret','ciel'];

function pick<T>(arr: T[], idx: number) { return arr[idx % arr.length]; }
function hash(str: string) { let h=0; for (let i=0;i<str.length;i++) h = (h*31 + str.charCodeAt(i)) >>> 0; return h; }

const AudioVideoBackdrop: React.FC<AudioVideoBackdropProps> = ({ active = false, theme = 'auto', seed = 'default' }) => {
  const [error, setError] = useState(false);

  const { src, finalTheme } = useMemo(() => {
    let chosenTheme = theme;
    const h = hash(seed + ':' + theme);
    if (theme === 'auto') {
      // auto: choisir en fonction de l'heure de la journée
      const hour = new Date().getHours();
      if (hour < 12) chosenTheme = 'ciel'; else if (hour < 18) chosenTheme = 'mer'; else chosenTheme = 'foret';
    }
    const themeVideos = videos[chosenTheme as keyof typeof videos] || videos['mer'];
    return { src: pick(themeVideos, hash(seed) % themeVideos.length), finalTheme: chosenTheme };
  }, [theme, seed]);

  useEffect(() => { setError(false); }, [src]);

  if (!active || error) return null;
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none" aria-label={`video ambiance ${finalTheme}`}>
      <video
        key={src}
        className="w-full h-full object-cover opacity-45 mix-blend-overlay animate-[fadeIn_1.2s_ease]"
        src={src}
        autoPlay
        muted
        loop
        playsInline
        onError={() => setError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
    </div>
  );
};

export default AudioVideoBackdrop;
