import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';
import { Button } from '@/components/ui/button';

interface MoodOption {
  emoji: string;
  label: string;
  description: string;
  value: number; // 1..5 scale
  color: string; // tailwind classes
  ring: string;  // focus/selected ring color
}

const moodOptions: MoodOption[] = [
  { emoji: '😔', label: 'Difficile', description: 'Brouillard émotionnel, besoin de soutien', value: 1, color: 'bg-red-50 hover:bg-red-100', ring: 'ring-red-400' },
  { emoji: '😐', label: 'Moyen', description: 'Équilibré mais neutre', value: 2, color: 'bg-orange-50 hover:bg-orange-100', ring: 'ring-orange-400' },
  { emoji: '🙂', label: 'Bien', description: 'Énergie stable, optimisme mesuré', value: 3, color: 'bg-yellow-50 hover:bg-yellow-100', ring: 'ring-yellow-400' },
  { emoji: '😊', label: 'Très bien', description: 'Belle énergie positive', value: 4, color: 'bg-green-50 hover:bg-green-100', ring: 'ring-green-400' },
  { emoji: '😁', label: 'Excellent', description: 'Humeur rayonnante', value: 5, color: 'bg-emerald-50 hover:bg-emerald-100', ring: 'ring-emerald-400' }
];

interface MoodSelectorV2Props {
  value?: number;
  onChange?: (value: number) => void;
  onSaved?: (value: number) => void;
  autoSave?: boolean; // saves automatically (debounced) when value changes
  debounceMs?: number; // default 600
  className?: string;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const MoodSelectorV2: React.FC<MoodSelectorV2Props> = ({
  value,
  onChange,
  onSaved,
  autoSave = false,
  debounceMs = 600,
  className = ''
}) => {
  const [internalValue, setInternalValue] = useState<number | undefined>(value);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const lastSavedRef = useRef<number | undefined>();
  const timerRef = useRef<number | undefined>();
  // Dialog/details removed; keep placeholder variable for backward payload compatibility.
  const detailValue = '';

  // Prefill today's existing entry details
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const today = await apiService.healthData.getTodayMood?.();
        if (mounted && today?.entry) {
          const e = today.entry as any;
            // previously would load detail text; dialog removed.
            if (e.mood_level && !internalValue) {
              setInternalValue(e.mood_level);
              lastSavedRef.current = e.mood_level;
            }
        }
      } catch (err) {
        // silent
      }
    })();
    return () => { mounted = false; };
  }, []);

  // sync from outside
  useEffect(() => { setInternalValue(value); }, [value]);

  const selectMood = useCallback((v: number) => {
    setInternalValue(v);
    onChange?.(v);
  }, [onChange]);

  const saveMood = useCallback(async (v: number) => {
    if (v === lastSavedRef.current) return; // nothing new
    try {
      setSaveState('saving');
      setErrorMessage('');
  const payload = {
        date: new Date().toISOString().split('T')[0],
        mood_level: v,
        mood_emoji: moodOptions.find(o => o.value === v)?.emoji || '🙂',
        energy_level: 5,
        stress_level: 3,
        sleep_quality: null,
    notes: detailValue || null,
  details: detailValue || null,
        activities: [],
        emotions: []
      };
      await apiService.healthData.saveMoodData(payload);
      lastSavedRef.current = v;
      setSaveState('saved');
      onSaved?.(v);
      window.setTimeout(() => setSaveState(s => s === 'saved' ? 'idle' : s), 2500);
    } catch (e: any) {
      setSaveState('error');
      setErrorMessage(e?.message || 'Erreur lors de la sauvegarde');
    }
  }, [onSaved]);

  // saveDetails removed with dialog.

  // auto-save with debounce
  useEffect(() => {
    if (!autoSave) return;
    if (internalValue == null) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => saveMood(internalValue), debounceMs) as unknown as number;
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [internalValue, autoSave, debounceMs, saveMood]);

  // keyboard navigation (arrow keys) when focusing wrapper
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (['ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const currentIndex = moodOptions.findIndex(o => o.value === internalValue) || 0;
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const next = moodOptions[(currentIndex + dir + moodOptions.length) % moodOptions.length];
        selectMood(next.value);
      }
      if (e.key === 'Enter' && internalValue && autoSave === false) {
        saveMood(internalValue);
      }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [internalValue, selectMood, saveMood, autoSave]);

  return (
    <Card className={`p-6 glass-card border-0 shadow-lg ${className}`}>      
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold">Votre humeur actuelle</h3>
        {saveState === 'saving' && <span className="flex items-center gap-1 text-xs text-emerald-600"><Loader2 className="h-3 w-3 animate-spin"/>Sauvegarde...</span>}
        {saveState === 'saved' && <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3 w-3"/>Sauvegardé</span>}
        {saveState === 'error' && <span className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="h-3 w-3"/>Erreur</span>}
      </div>

      {saveState === 'error' && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div 
        ref={containerRef}
        role="radiogroup"
        aria-label="Sélection d'humeur"
        tabIndex={0}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3 outline-none"
      >
        {moodOptions.map(opt => {
          const selected = internalValue === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => selectMood(opt.value)}
              disabled={saveState === 'saving'}
              className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all text-center focus-visible:outline-none focus-visible:ring-2 ${opt.color} ${selected ? `ring-2 ${opt.ring} scale-105 shadow` : 'hover:scale-105'} ${saveState === 'saving' ? 'opacity-60 cursor-progress' : ''}`}
            >
              <span className="text-3xl mb-1" aria-hidden>{opt.emoji}</span>
              <span className="text-xs font-medium text-emerald-900 mb-0.5">{opt.label}</span>
              <span className="text-[10px] leading-snug text-emerald-800/70 hidden sm:block">{opt.description}</span>
              {selected && saveState === 'saved' && (
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px] shadow">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!autoSave && internalValue && saveState !== 'saved' && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => saveMood(internalValue)}
            className="px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            disabled={saveState === 'saving'}
          >
            {saveState === 'saving' ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      )}
  {/* Details dialog removed as requested */}
    </Card>
  );
};

export default MoodSelectorV2;
