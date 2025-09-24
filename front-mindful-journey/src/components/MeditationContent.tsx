import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, CheckCircle, Brain } from 'lucide-react';

interface MeditationContentProps {
  onBack: () => void;
  onComplete: () => void;
}

const MeditationContent = ({ onBack, onComplete }: MeditationContentProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(600); // fallback 10 min
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState(0);

  const [mp3Src, setMp3Src] = useState<string>('/audio/track-4.mp3'); // MP3 source
  const [mp3Presets] = useState<Array<{ key: string; label: string; url: string }>>([
    { key: 'track-4', label: 'Track 4 (local)', url: '/audio/track-4.mp3' }
  ]);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('track-4'); // Default preset

  const steps = [
    { title: 'Préparation', instruction: 'Installez-vous confortablement, fermez les yeux et détendez vos épaules.', duration: 60 },
    { title: 'Respiration consciente', instruction: 'Concentrez-vous sur votre respiration naturelle.', duration: 180 },
    { title: 'Scan corporel', instruction: 'Portez attention à chaque partie du corps.', duration: 240 },
    { title: 'Pensées et émotions', instruction: 'Observez vos pensées sans jugement.', duration: 180 },
    { title: 'Retour en douceur', instruction: 'Bougez doucement vos doigts et ouvrez les yeux.', duration: 60 },
  ];

  const totalDuration = useMemo(() => steps.reduce((s, it) => s + it.duration, 0), []);
  const effectiveDuration = duration || totalDuration;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = useMemo(() => {
    if (effectiveDuration <= 0) return 0;
    return (currentTime / effectiveDuration) * 100;
  }, [currentTime, effectiveDuration]);

  useEffect(() => {
    const p = mp3Presets.find(x => x.key === selectedPresetKey) || mp3Presets[0];
    if (p?.url) {
      setSelectedPresetKey(p.key);
      setMp3Src(p.url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPresetChange = (key: string) => {
    setSelectedPresetKey(key);
    const p = mp3Presets.find(x => x.key === key);
    if (p?.url) setMp3Src(p.url);
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onLoaded = () => {
      if (el.duration && isFinite(el.duration)) setDuration(Math.round(el.duration));
    };
    const onTime = () => setCurrentTime(el.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(el.duration || duration);
      setIsCompleted(true);
      onComplete();
    };
    const onError = () => {
      const failing = el.currentSrc || mp3Src;
      setAudioError(`Erreur de chargement audio: ${failing}. Essayez un préréglage.`);
    };

    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
    };
  }, [onComplete, duration, mp3Src]);

  const handlePlayPause = async () => {
    const el = audioRef.current;
    if (!el) return;
    try {
      if (isPlaying) {
        el.pause();
        setIsPlaying(false);
      } else {
        if (el.src !== mp3Src) { try { el.src = mp3Src; el.load(); } catch { } }
        try { el.muted = false; } catch { }
        try { el.volume = 1; } catch { }
        try {
          await el.play();
          setIsPlaying(true);
        } catch (err) {
          const once = () => {
            el.removeEventListener('canplay', once);
            el.play().then(() => setIsPlaying(true)).catch(() => setAudioError("Impossible de démarrer la lecture."));
          };
          el.addEventListener('canplay', once, { once: true } as any);
          try { el.load(); } catch { }
        }
      }
    } catch (e: any) {
      console.error('Audio play error:', e);
      setAudioError("Impossible de lire l'audio.");
    }
  };

  const handleReset = () => {
    const el = audioRef.current;
    if (el) {
      try { el.pause(); } catch { }
      try { el.currentTime = 0; } catch { }
    }
    setIsPlaying(false);
    setIsCompleted(false);
    setAudioError(null);
    setCurrentTime(0);
    setCurrentStep(0);
  };

  const handleReplay = async () => {
    const el = audioRef.current;
    if (!el) return;
    try { el.pause(); } catch { }
    el.currentTime = 0;
    setIsCompleted(false);
    setCurrentTime(0);
    setCurrentStep(0);
    setAudioError(null);
    try { await el.play(); setIsPlaying(true); } catch (e) { setAudioError("Lecture impossible au redémarrage."); setIsPlaying(false); }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setIsPlaying(false);
    onComplete();
  };

  // Compute boundaries and sync step
  const stepBoundaries = useMemo(() => {
    let sum = 0;
    return steps.map((s) => (sum += s.duration));
  }, [steps]);

  useEffect(() => {
    const idx = stepBoundaries.findIndex((end) => currentTime < end);
    const nextStep = idx === -1 ? steps.length - 1 : idx;
    setCurrentStep(nextStep);
  }, [currentTime, stepBoundaries]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>← Retour</Button>
        <Badge className="bg-purple-100 text-purple-800"><Brain className="h-3 w-3 mr-1" />Mindfulness</Badge>
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-800">Méditation guidée</CardTitle>
          <p className="text-purple-600">Une séance de relaxation pour réduire le stress</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="px-3 py-1 rounded-full text-sm border bg-white border-purple-300 text-purple-700">Audio MP3</div>
          </div>

          <audio ref={audioRef} src={mp3Src} preload="none" controls playsInline className="w-full" />
          <div className="text-xs text-gray-600 mt-1">Lecture: MP3 → {mp3Src}</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">Préréglages</label>
              <select className="w-full border rounded-md px-3 py-2 bg-white" onChange={(e) => onPresetChange(e.target.value)} value={selectedPresetKey}>
                {mp3Presets.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-purple-800 mb-2">{formatTime(Math.max(0, Math.round(effectiveDuration - currentTime)))}</div>
            <Progress value={progress} className="w-full" />
            {audioError && (<div className="text-xs text-red-600 mt-2">{audioError}</div>)}
            <div className="text-xs text-gray-500 mt-1">Placez un MP3 libre de droits dans public/audio/ ou utilisez un préréglage.</div>
          </div>

          {!isCompleted && (
            <Card className="bg-white/70">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3"><span className="text-sm font-bold text-purple-800">{currentStep + 1}</span></div>
                  <h3 className="font-semibold text-gray-800">{steps[currentStep]?.title}</h3>
                </div>
                <p className="text-gray-600 ml-11">{steps[currentStep]?.instruction}</p>
              </CardContent>
            </Card>
          )}

          {isCompleted && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800 mb-1">Félicitations !</h3>
                <p className="text-green-600">Vous avez terminé votre séance de méditation</p>
              </CardContent>
            </Card>
          )}

          <div className="flex space-x-3 justify-center">
            <Button variant="outline" size="icon" onClick={handleReset} className="rounded-full"><RotateCcw className="h-4 w-4" /></Button>

            {isCompleted ? (
              <>
                <Button onClick={handleReplay} className="bg-purple-600 hover:bg-purple-700 text-white px-8 rounded-full">Rejouer</Button>
                <Button onClick={onBack} className="px-8 rounded-full" variant="outline">Terminé</Button>
              </>
            ) : (
              <Button onClick={handlePlayPause} className="bg-purple-600 hover:bg-purple-700 text-white px-8 rounded-full">
                {isPlaying ? (<><Pause className="h-4 w-4 mr-2" />Pause</>) : (<><Play className="h-4 w-4 mr-2" />Commencer</>)}
              </Button>
            )}

            {!isCompleted && (<Button variant="ghost" onClick={handleComplete} className="text-gray-600">Terminer</Button>)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeditationContent;
