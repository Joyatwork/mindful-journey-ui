import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobilePageShell from '@/components/MobilePageShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import apiService from '@/lib/api';

// Page de détails libre pour humeur négative après sélection facteurs.
// Autosave (debounce) + persistance quand on quitte et revient.

const NegativeMoodDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { mood?: number; factors?: string[] } | undefined;
  const moodLevel = state?.mood ?? 2;
  const factors = state?.factors || [];

  const [details, setDetails] = useState('');
  const [detailSaveState, setDetailSaveState] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const timerRef = useRef<number | null>(null);
  const lastSavedRef = useRef('');

  // Charger notes existantes si déjà sauvegardées
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const today = await apiService.healthData.getTodayMood?.();
        const entry = today?.entry as any;
        if (mounted && entry) {
          if (entry.details) {
            setDetails(entry.details);
            lastSavedRef.current = entry.details;
          }
        }
      } catch { /* silencieux */ }
    })();
    return () => { mounted = false; };
  }, []);

  // Autosave
  useEffect(() => {
    if (!moodLevel) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      if (details.trim() === lastSavedRef.current.trim()) return;
      setDetailSaveState('saving');
      try {
        await apiService.healthData.saveMoodData({
          date: new Date().toISOString().split('T')[0],
          mood_level: moodLevel,
          mood_emoji: moodLevel === 1 ? '😔' : '😐',
          energy_level: 3,
          stress_level: 6,
          sleep_quality: null,
          notes: null,
          details: details.trim() || null,
          activities: factors, // réutiliser champ activities pour facteurs pour l'instant
          emotions: []
        });
        lastSavedRef.current = details;
        setDetailSaveState('saved');
        window.setTimeout(() => {
          setDetailSaveState(s => s === 'saved' ? 'idle' : s);
        }, 2500);
      } catch {
        setDetailSaveState('error');
        window.setTimeout(() => setDetailSaveState('idle'), 3500);
      }
    }, 800) as unknown as number;
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [details, moodLevel, factors.join('|')]);

  const goContinue = () => {
    navigate('/mood-negative-support', { state: { mood: moodLevel, factors } });
  };

  return (
    <MobilePageShell gradient="emerald">
      <Card className="p-6 md:p-8 shadow-xl border-emerald-100 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Button size="sm" variant="outline" onClick={() => navigate(-1)}>Retour</Button>
          <h1 className="text-lg font-bold text-emerald-800">Peux-tu m'en dire plus ?</h1>
        </div>
        <div className="relative">
          <Textarea
            placeholder="Décris ce qui te pèse ou ce que tu ressens..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="min-h-[160px] resize-vertical pr-32"
          />
          <div className="absolute top-2 right-3 flex items-center gap-2 text-[11px]">
            {detailSaveState === 'saving' && <span className="text-emerald-600">Sauvegarde...</span>}
            {detailSaveState === 'saved' && <span className="text-emerald-600">Enregistré</span>}
            {detailSaveState === 'error' && <span className="text-red-600">Erreur</span>}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={goContinue}
          >Continuer</Button>
          <Button
            variant="outline"
            className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigate('/mood-negative-support', { state: { mood: moodLevel, factors } })}
          >Ignorer</Button>
        </div>
      </Card>
    </MobilePageShell>
  );
};

export default NegativeMoodDetailsPage;
