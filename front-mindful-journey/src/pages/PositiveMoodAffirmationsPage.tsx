import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartHandshake } from 'lucide-react';
import MobilePageShell from '@/components/MobilePageShell';
// Animation de célébration: pluie de fleurs

const affirmations = [
  'Génial !',
  'Tu es au top de ta forme !',
  'Quelle bonne nouvelle !',
  'N\'hésite pas à partager tes progrès autour de toi !',
  'Je t\'admire !',
  'C\'est super !',
  'Merveilleux !',
  'C\'est extraordinaire !',
  'Excellent !',
  'Bravo !'
];

const PositiveMoodAffirmationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { mood?: number } | undefined;

  // Génération des fleurs (emoji) avec positions et timings
  const flowers = useMemo(() => {
    const symbols = ['🌸','🌼','🌺','🌷','💮','🌻'];
    // Durées plus courtes et délais réduits pour accélérer la pluie
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // pourcentage
      delay: Math.random() * 3,  // plus rapide entre 0 et 3s
      duration: 3 + Math.random() * 3, // entre 3 et 6s au lieu de 6-11s
      size: 18 + Math.random() * 20,
      symbol: symbols[i % symbols.length],
      rotate: (Math.random() * 60 - 30) // un peu plus de rotation
    }));
  }, []);

  return (
    <MobilePageShell gradient="emerald">
      <Card className="p-6 md:p-8 shadow-xl border-emerald-100 relative overflow-hidden">
        <div className="flex flex-col items-center gap-8 text-center relative z-10">
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-emerald-400/25 via-emerald-300/15 to-transparent blur-xl animate-pulse" />
            <HeartHandshake className="h-20 w-20 text-emerald-500 drop-shadow" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-700">Inspiration positive</h1>
          <ul className="space-y-3 w-full">
            {affirmations.map((a,i)=>(
              <li
                key={i}
                className="text-emerald-900 text-lg font-semibold bg-white/75 rounded-xl px-5 py-3 shadow-sm border border-emerald-100 backdrop-blur-sm"
              >{a}</li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
            <Button
              variant="outline"
              className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => navigate(-1)}
            >Retour</Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => navigate('/mood-positive-happiness', { state: { mood: state?.mood } })}
            >Continuer</Button>
          </div>
        </div>
        {/* Pluie de fleurs au-dessus du contenu */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
          {flowers.map(f => (
            <span
              key={f.id}
              className="absolute animate-flower-fall will-change-transform select-none drop-shadow-sm"
              style={{
                left: `${f.left}%`,
                top: '-10%',
                animationDelay: `${f.delay}s`,
                animationDuration: `${f.duration}s`,
                fontSize: `${f.size}px`,
                transform: `rotate(${f.rotate}deg)`,
                opacity: 0.9
              }}
            >{f.symbol}</span>
          ))}
        </div>
        <style>{`
          @keyframes flowerFall {
            0% { transform: translate3d(0,-15%,0) rotate(var(--r,0deg)) scale(0.9); opacity:0; }
            8% { opacity:1; }
            85% { opacity:1; }
            100% { transform: translate3d(0,115vh,0) rotate(calc(var(--r,0deg) + 220deg)) scale(1); opacity:0; }
          }
          .animate-flower-fall { animation-name: flowerFall; animation-timing-function: linear; animation-iteration-count: infinite; }
        `}</style>
      </Card>
    </MobilePageShell>
  );
};

export default PositiveMoodAffirmationsPage;
