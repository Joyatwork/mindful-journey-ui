import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import apiService from '@/lib/api';
import MobilePageShell from '@/components/MobilePageShell';

const options = [
  { key: 'satisfait', label: 'satisfait(e)?' },
  { key: 'heureux', label: 'heureux(se)?' },
  { key: 'epanoui', label: 'épanoui(e)?' }
];

const PositiveMoodReflectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { mood?: number } | undefined;
  const [selected, setSelected] = useState<string[]>([]);
  const [details, setDetails] = useState('');
  const [saving, setSaving] = useState(false); // saving final (bouton Continuer)
  const [error, setError] = useState('');
  const [detailSaveState, setDetailSaveState] = useState<'idle'|'saving'|'saved'|'error'>('idle');
  const detailTimerRef = useRef<number | null>(null);
  const lastSavedRef = useRef<string>('');

  const toggle = (key: string) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  // Pré-chargement des données déjà enregistrées (revenir sur la page sans perdre)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const today = await apiService.healthData.getTodayMood?.();
        const entry = today?.entry as any;
        if (mounted && entry) {
          const existing = entry?.details || entry?.notes;
          if (existing) {
            setDetails(existing);
            lastSavedRef.current = existing;
          }
          if (Array.isArray(entry.activities) && entry.activities.length) {
            // filtrer seulement ceux de nos options pour éviter du bruit
            const allowed = options.map(o=>o.key);
            setSelected(entry.activities.filter((a:string)=>allowed.includes(a)));
          }
        }
      } catch (e) {
        // silencieux
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Auto-save détails (debounce)
  useEffect(() => {
    if (!state?.mood) return;
    if (detailTimerRef.current) window.clearTimeout(detailTimerRef.current);
    // Déclenche si texte différent de dernière sauvegarde après 800ms
    detailTimerRef.current = window.setTimeout(async () => {
      if (details.trim() === lastSavedRef.current.trim()) return;
      setDetailSaveState('saving');
      try {
        await apiService.healthData.saveMoodData({
          date: new Date().toISOString().split('T')[0],
          mood_level: state.mood,
          mood_emoji: '🙂',
          energy_level: 5,
          stress_level: 3,
          sleep_quality: null,
          notes: details.trim() || null,
          details: details.trim() || null,
          activities: selected,
          emotions: []
        });
        lastSavedRef.current = details;
        setDetailSaveState('saved');
        window.setTimeout(() => {
          setDetailSaveState(s => s === 'saved' ? 'idle' : s);
        }, 2500);
      } catch (e) {
        setDetailSaveState('error');
        window.setTimeout(() => setDetailSaveState('idle'), 4000);
      }
    }, 800) as unknown as number;
    return () => { if (detailTimerRef.current) window.clearTimeout(detailTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [details, state?.mood, selected.join('|')]);

  const handleContinue = async () => {
    setSaving(true);
    setError('');
    try {
      if (state?.mood) {
        await apiService.healthData.saveMoodData({
          date: new Date().toISOString().split('T')[0],
          mood_level: state.mood,
          mood_emoji: '🙂',
          energy_level: 5,
          stress_level: 3,
          sleep_quality: null,
          notes: details.trim() || null,
          details: details.trim() || null,
          activities: selected,
          emotions: []
  });
  lastSavedRef.current = details; // aligner
      }
  navigate('/mood-positive-affirmations', { state: { mood: state?.mood } });
    } catch (e: any) {
      setError(e?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobilePageShell gradient="emerald">
      <Card className="p-6 md:p-8 shadow-xl border-emerald-100">
        <div className="flex items-center gap-3 mb-6">
          <Button size="sm" variant="outline" onClick={() => navigate(-1)} disabled={saving}>Retour</Button>
          <h1 className="text-xl font-bold tracking-tight text-emerald-800 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-500" />
            Es-tu...
          </h1>
        </div>
        <div className="space-y-4 mb-6">
          {options.map(o => (
            <label key={o.key} className="flex items-center gap-3 text-sm bg-white/60 rounded-lg px-4 py-3 border border-emerald-100 hover:border-emerald-300 transition cursor-pointer">
              <Checkbox checked={selected.includes(o.key)} onCheckedChange={() => toggle(o.key)} />
              <span className="text-emerald-900">{o.label}</span>
            </label>
          ))}
        </div>
        <p className="text-emerald-900/80 text-sm font-medium mb-2">Peux-tu m'en dire plus ?</p>
        <div className="relative">
          <Textarea
            placeholder="Décris ce qui contribue à ces ressentis positifs..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="min-h-[140px] resize-vertical pr-28"
          />
          <div className="absolute top-2 right-2 flex items-center gap-2">
            {detailSaveState === 'saving' && <span className="text-[11px] text-emerald-600">Sauvegarde...</span>}
            {detailSaveState === 'saved' && <span className="text-[11px] text-emerald-600">Enregistré</span>}
            {detailSaveState === 'error' && <span className="text-[11px] text-red-600">Erreur</span>}
          </div>
        </div>
        <div className="h-2" />
        {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleContinue}
            disabled={saving}
          >{saving ? 'Enregistrement...' : 'Continuer'}</Button>
          <Button
            variant="outline"
            className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => navigate('/mood-positive-affirmations', { state: { mood: state?.mood } })}
            disabled={saving}
          >Ignorer</Button>
        </div>
      </Card>
    </MobilePageShell>
  );
};

export default PositiveMoodReflectionPage;
