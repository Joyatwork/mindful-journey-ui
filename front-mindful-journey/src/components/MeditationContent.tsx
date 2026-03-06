import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(600); // fallback 10 min
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState(0);

  const [mp3Src, setMp3Src] = useState<string>('/audio/track-4.mp3'); // MP3 source
  const [mp3Presets] = useState<Array<{ key: string; label: string; url: string }>>([
    { key: 'track-4', label: 'Track 4 (local)', url: '/audio/track-4.mp3' },
    { key: 'track-2', label: 'Track 2 (local)', url: '/audio/track-2.m4a' },
    { key: 'track-3', label: 'Track 3 (local)', url: '/audio/track-3.m4a' },
    { key: 'meditation-midi', label: 'Meditation MIDI (local)', url: '/audio/meditation-midi.m4a' },
  ]);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('track-4'); // Default preset

  const steps = [
    { title: t('meditation.content.steps.preparation.title'), instruction: t('meditation.content.steps.preparation.instruction'), duration: 60 },
    { title: t('meditation.content.steps.consciousBreathing.title'), instruction: t('meditation.content.steps.consciousBreathing.instruction'), duration: 180 },
    { title: t('meditation.content.steps.bodyScan.title'), instruction: t('meditation.content.steps.bodyScan.instruction'), duration: 240 },
    { title: t('meditation.content.steps.thoughtsEmotions.title'), instruction: t('meditation.content.steps.thoughtsEmotions.instruction'), duration: 180 },
    { title: t('meditation.content.steps.gentleReturn.title'), instruction: t('meditation.content.steps.gentleReturn.instruction'), duration: 60 },
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
      setAudioError(`${t('meditation.content.audioLoadError')}: ${failing}. ${t('meditation.content.tryPreset')}`);
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
        try {
          const abs = (() => { try { return new URL(mp3Src, window.location.href).href; } catch { return mp3Src; } })();
          if (!el.src || el.src !== abs) { el.src = abs; try { el.load(); } catch { } }
        } catch { }
        try { el.muted = false; } catch { }
        try { el.volume = 1; } catch { }
        try {
          await el.play();
          setIsPlaying(true);
        } catch (err) {
          const once = () => {
            el.removeEventListener('canplay', once);
            el.play().then(() => setIsPlaying(true)).catch(() => setAudioError(t('meditation.content.cannotStartPlayback')));
          };
          el.addEventListener('canplay', once, { once: true } as any);
          try { el.load(); } catch { }
        }
      }
    } catch (e: any) {
      console.error('Audio play error:', e);
      setAudioError(t('meditation.content.cannotPlayAudio'));
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
    try { await el.play(); setIsPlaying(true); } catch (e) { setAudioError(t('meditation.content.restartPlaybackFailed')); setIsPlaying(false); }
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
        <Button variant="ghost" onClick={onBack}>{t('meditation.content.backButton')}</Button>
        <Badge className="bg-purple-100 text-purple-800"><Brain className="h-3 w-3 mr-1" />Mindfulness</Badge>
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-800">{t('meditation.content.guidedTitle')}</CardTitle>
          <p className="text-purple-600">{t('meditation.content.relaxationSubtitle')}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* audio label removed per request */}

          {/* hidden native audio element (controls removed) */}
          <audio ref={audioRef} src={mp3Src} preload="none" playsInline style={{ display: 'none' }} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-3">
              <label className="block text-sm text-gray-600 mb-1">{t('meditation.content.audioList')}</label>
              <select className="w-full border rounded-md px-3 py-2 bg-white" onChange={(e) => onPresetChange(e.target.value)} value={selectedPresetKey}>
                {mp3Presets.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="text-center">
            <Progress value={progress} className="w-full" />
            {audioError && (<div className="text-xs text-red-600 mt-2">{audioError}</div>)}
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
                <h3 className="font-semibold text-green-800 mb-1">{t('meditation.content.congratulations')}</h3>
                <p className="text-green-600">{t('meditation.content.completedMessage')}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex space-x-3 justify-center">
            <Button variant="outline" size="icon" onClick={handleReset} className="rounded-full"><RotateCcw className="h-4 w-4" /></Button>

            {isCompleted ? (
              <>
                <Button onClick={handleReplay} className="bg-purple-600 hover:bg-purple-700 text-white px-8 rounded-full">{t('meditation.content.replay')}</Button>
                <Button onClick={onBack} className="px-8 rounded-full" variant="outline">{t('meditation.content.finished')}</Button>
              </>
            ) : (
              <Button onClick={handlePlayPause} className="bg-purple-600 hover:bg-purple-700 text-white px-8 rounded-full">
                {isPlaying ? (<><Pause className="h-4 w-4 mr-2" />{t('meditation.pause')}</>) : (<><Play className="h-4 w-4 mr-2" />{t('meditation.start')}</>)}
              </Button>
            )}

            {!isCompleted && (<Button variant="ghost" onClick={handleComplete} className="text-gray-600">{t('meditation.content.finish')}</Button>)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeditationContent;
