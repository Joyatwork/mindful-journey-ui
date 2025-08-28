import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import MobilePageShell from '@/components/MobilePageShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Page d'affichage progressif de messages de soutien

const MESSAGES = [
  "Je suis là pour toi !",
  "Sois rassuré(e) la situation va s'améliorer",
  "Aie confiance en toi, tu es capable d'accomplir de belles choses",
  "Tu es capable de réussir car tu as confiance en toi et tu restes positif pour évoluer",
  "Autorise - toi à toujours prendre soin de toi, car ton bien-être est précieux",
  "Ton Expert Praticien t'accompagne jusqu'au rétablissement"
];

const NegativeMoodSupportMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { mood?: number; factors?: string[] } | undefined;
  const moodLevel = state?.mood ?? 2;
  const factors = state?.factors || [];

  const [visibleCount, setVisibleCount] = useState(0);
  const [finished, setFinished] = useState(false);

  // Dévoilement progressif
  useEffect(() => {
    if (visibleCount >= MESSAGES.length) {
      setFinished(true);
      return;
    }
    const delay = visibleCount === 0 ? 300 : 1600; // petite pause initiale, puis rythme
    const t = setTimeout(() => setVisibleCount(c => c + 1), delay);
    return () => clearTimeout(t);
  }, [visibleCount]);

  const skipAll = () => {
    setVisibleCount(MESSAGES.length);
    setFinished(true);
  };

  const goContinue = () => {
    navigate('/mood-negative-inspiration', { state: { mood: moodLevel, factors } });
  };

  return (
    <MobilePageShell gradient="emerald">
      <Card className="p-6 md:p-8 shadow-xl border-emerald-100 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Button size="sm" variant="outline" onClick={() => navigate(-1)}>Retour</Button>
          <h1 className="text-lg font-bold text-emerald-800">Soutien</h1>
        </div>
        <div className="space-y-5 min-h-[260px] relative">
          <AnimatePresence initial={false}>
            {MESSAGES.slice(0, visibleCount).map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 14, scale: 0.965, filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, scale: 0.955, filter: 'blur(4px)' }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: idx * 0.10 }}
                className="relative rounded-xl px-5 py-4 text-sm font-medium leading-relaxed tracking-wide shadow-sm border border-emerald-100/70 bg-white/70 backdrop-blur-md text-emerald-800/95 ring-1 ring-emerald-200/30 overflow-hidden group"
              >
                {/* gradient accent */}
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.18),transparent_60%)]" />
                {/* subtle highlight sweep */}
                <span className="pointer-events-none absolute -left-24 top-0 h-full w-32 rotate-6 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-70 animate-[shine_2.8s_ease_infinite]" />
                <span className="relative z-10 block">{m}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {/* keyframes for shine */}
        <style>{`@keyframes shine { 0% { transform:translateX(0); } 100% { transform:translateX(420%); } }`}</style>
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          {finished ? (
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={goContinue}>Continuer</Button>
          ) : (
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={skipAll}>Afficher tout</Button>
          )}
          <Button
            variant="outline"
            className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={goContinue}
            disabled={!finished}
          >Passer</Button>
        </div>
      </Card>
    </MobilePageShell>
  );
};

export default NegativeMoodSupportMessagesPage;
