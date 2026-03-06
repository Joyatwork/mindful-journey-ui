import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Calendar, TrendingUp, TrendingDown, Minus, Smile, Frown, Meh, Heart, Zap, Moon } from 'lucide-react';

interface MoodEntry {
  id?: number;
  date: string;
  mood_level: number;
  mood_emoji: string;
  energy_level?: number;
  stress_level?: number;
  sleep_quality?: number;
  notes?: string;
  activities?: string[];
  emotions?: string[];
}

interface MoodStats {
  weekly_average: number;
  monthly_average: number;
  current_streak: number;
  total_entries: number;
  recent_trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
}

const MoodTracker = () => {
  const { t } = useTranslation();
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<MoodEntry>({
    date: new Date().toISOString().split('T')[0],
    mood_level: 5,
    mood_emoji: '😐',
    energy_level: 5,
    stress_level: 5,
    sleep_quality: 5,
    notes: '',
    activities: [],
    emotions: []
  });

  const moodEmojis = [
    { value: 1, emoji: '😢', labelKey: 'moodTracker.moodLabels.verySad' },
    { value: 2, emoji: '😞', labelKey: 'moodTracker.moodLabels.sad' },
    { value: 3, emoji: '😕', labelKey: 'moodTracker.moodLabels.notGreat' },
    { value: 4, emoji: '😐', labelKey: 'moodTracker.moodLabels.neutral' },
    { value: 5, emoji: '🙂', labelKey: 'moodTracker.moodLabels.okay' },
    { value: 6, emoji: '😊', labelKey: 'moodTracker.moodLabels.good' },
    { value: 7, emoji: '😄', labelKey: 'moodTracker.moodLabels.veryGood' },
    { value: 8, emoji: '😁', labelKey: 'moodTracker.moodLabels.great' },
    { value: 9, emoji: '🤩', labelKey: 'moodTracker.moodLabels.fantastic' },
    { value: 10, emoji: '🥳', labelKey: 'moodTracker.moodLabels.extraordinary' }
  ];

  const commonActivities = [
    { key: 'work', labelKey: 'moodTracker.activities.work' },
    { key: 'sport', labelKey: 'moodTracker.activities.sport' },
    { key: 'meditation', labelKey: 'moodTracker.activities.meditation' },
    { key: 'reading', labelKey: 'moodTracker.activities.reading' },
    { key: 'cooking', labelKey: 'moodTracker.activities.cooking' },
    { key: 'friendsFamily', labelKey: 'moodTracker.activities.friendsFamily' },
    { key: 'nature', labelKey: 'moodTracker.activities.nature' },
    { key: 'music', labelKey: 'moodTracker.activities.music' },
    { key: 'artCreativity', labelKey: 'moodTracker.activities.artCreativity' },
    { key: 'tvMovies', labelKey: 'moodTracker.activities.tvMovies' },
    { key: 'rest', labelKey: 'moodTracker.activities.rest' },
    { key: 'housework', labelKey: 'moodTracker.activities.housework' }
  ];

  const commonEmotions = [
    { key: 'joy', labelKey: 'moodTracker.emotions.joy' },
    { key: 'gratitude', labelKey: 'moodTracker.emotions.gratitude' },
    { key: 'calm', labelKey: 'moodTracker.emotions.calm' },
    { key: 'confidence', labelKey: 'moodTracker.emotions.confidence' },
    { key: 'anxiety', labelKey: 'moodTracker.emotions.anxiety' },
    { key: 'stress', labelKey: 'moodTracker.emotions.stress' },
    { key: 'anger', labelKey: 'moodTracker.emotions.anger' },
    { key: 'sadness', labelKey: 'moodTracker.emotions.sadness' },
    { key: 'fear', labelKey: 'moodTracker.emotions.fear' },
    { key: 'excitement', labelKey: 'moodTracker.emotions.excitement' },
    { key: 'nostalgia', labelKey: 'moodTracker.emotions.nostalgia' },
    { key: 'hope', labelKey: 'moodTracker.emotions.hope' }
  ];

  useEffect(() => {
    fetchTodayEntry();
    fetchStats();
  }, []);

  const fetchTodayEntry = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/mood/today', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.entry) {
          setTodayEntry(data.entry);
          setCurrentEntry(data.entry);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'entrée du jour:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/mood/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/mood', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(currentEntry)
      });

      if (response.ok) {
        const data = await response.json();
        setTodayEntry(data.entry);
        fetchStats(); // Refresh stats
        
        // Show success message (you could use a toast here)
        alert(data.message);
      } else {
        alert('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateMoodLevel = (value: number) => {
    const emoji = moodEmojis.find(m => m.value === value)?.emoji || '😐';
    setCurrentEntry({
      ...currentEntry,
      mood_level: value,
      mood_emoji: emoji
    });
  };

  const toggleActivity = (activity: string) => {
    const activities = currentEntry.activities || [];
    const newActivities = activities.includes(activity)
      ? activities.filter(a => a !== activity)
      : [...activities, activity];
    
    setCurrentEntry({
      ...currentEntry,
      activities: newActivities
    });
  };

  const toggleEmotion = (emotion: string) => {
    const emotions = currentEntry.emotions || [];
    const newEmotions = emotions.includes(emotion)
      ? emotions.filter(e => e !== emotion)
      : [...emotions, emotion];
    
    setCurrentEntry({
      ...currentEntry,
      emotions: newEmotions
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-blue-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving':
        return t('moodTracker.improving');
      case 'declining':
        return t('moodTracker.declining');
      case 'stable':
        return t('moodTracker.stable');
      default:
        return t('moodTracker.insufficientData');
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">📊 {t('moodTracker.title')}</h1>
        <p className="text-gray-600">
          {t('moodTracker.howAreYouToday')}
        </p>
      </div>

      {/* Stats rapides */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.weekly_average}</div>
              <div className="text-sm text-gray-600">{t('moodTracker.weeklyAverage')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.current_streak}</div>
              <div className="text-sm text-gray-600">{t('moodTracker.consecutiveDays')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.total_entries}</div>
              <div className="text-sm text-gray-600">{t('moodTracker.totalEntries')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center flex items-center justify-center gap-2">
              {getTrendIcon(stats.recent_trend)}
              <div className="text-sm text-gray-600">{getTrendText(stats.recent_trend)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulaire de saisie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {todayEntry ? t('moodTracker.update') : t('moodTracker.newEntry')} - {new Date().toLocaleDateString()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélecteur d'humeur */}
          <div>
            <label className="block text-sm font-medium mb-3">
              {t('moodTracker.generalMood')}
            </label>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{currentEntry.mood_emoji}</span>
              <div className="flex-1">
                <Slider
                  value={[currentEntry.mood_level]}
                  onValueChange={(value) => updateMoodLevel(value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{t('moodTracker.veryBad')}</span>
                  <span>{t('moodTracker.perfect')}</span>
                </div>
              </div>
              <Badge variant="outline">{currentEntry.mood_level}/10</Badge>
            </div>
          </div>

          {/* Niveaux détaillés */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {t('moodTracker.energy')}
              </label>
              <Slider
                value={[currentEntry.energy_level || 5]}
                onValueChange={(value) => setCurrentEntry({...currentEntry, energy_level: value[0]})}
                max={10}
                min={1}
                step={1}
              />
              <div className="text-center text-sm text-gray-600 mt-1">
                {currentEntry.energy_level}/10
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                {t('moodTracker.stress')}
              </label>
              <Slider
                value={[currentEntry.stress_level || 5]}
                onValueChange={(value) => setCurrentEntry({...currentEntry, stress_level: value[0]})}
                max={10}
                min={1}
                step={1}
              />
              <div className="text-center text-sm text-gray-600 mt-1">
                {currentEntry.stress_level}/10
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Moon className="h-4 w-4" />
                {t('moodTracker.sleepQuality')}
              </label>
              <Slider
                value={[currentEntry.sleep_quality || 5]}
                onValueChange={(value) => setCurrentEntry({...currentEntry, sleep_quality: value[0]})}
                max={10}
                min={1}
                step={1}
              />
              <div className="text-center text-sm text-gray-600 mt-1">
                {currentEntry.sleep_quality}/10
              </div>
            </div>
          </div>

          {/* Activités */}
          <div>
            <label className="block text-sm font-medium mb-3">
              {t('moodTracker.dayActivities')}
            </label>
            <div className="flex flex-wrap gap-2">
              {commonActivities.map((activity) => (
                <Badge
                  key={activity.key}
                  variant={currentEntry.activities?.includes(activity.key) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleActivity(activity.key)}
                >
                  {t(activity.labelKey)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Émotions */}
          <div>
            <label className="block text-sm font-medium mb-3">
              {t('moodTracker.feltEmotions')}
            </label>
            <div className="flex flex-wrap gap-2">
              {commonEmotions.map((emotion) => (
                <Badge
                  key={emotion.key}
                  variant={currentEntry.emotions?.includes(emotion.key) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleEmotion(emotion.key)}
                >
                  {t(emotion.labelKey)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-3">
              {t('moodTracker.notesOptional')}
            </label>
            <Textarea
              value={currentEntry.notes || ''}
              onChange={(e) => setCurrentEntry({...currentEntry, notes: e.target.value})}
              placeholder={t('moodTracker.notesPlaceholder')}
              className="min-h-[100px]"
            />
          </div>

          {/* Bouton de sauvegarde */}
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? t('moodTracker.saving') : (todayEntry ? t('moodTracker.update') : t('moodTracker.save'))}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodTracker;
