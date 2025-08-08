
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import apiService from '@/lib/api';

interface MoodOption {
  emoji: string;
  label: string;
  value: number;
  color: string;
}

const moodOptions: MoodOption[] = [
  { emoji: '😔', label: 'Difficile', value: 1, color: 'bg-red-100 hover:bg-red-200' },
  { emoji: '😐', label: 'Moyen', value: 2, color: 'bg-orange-100 hover:bg-orange-200' },
  { emoji: '🙂', label: 'Bien', value: 3, color: 'bg-yellow-100 hover:bg-yellow-200' },
  { emoji: '😊', label: 'Très bien', value: 4, color: 'bg-green-100 hover:bg-green-200' },
  { emoji: '😁', label: 'Excellent', value: 5, color: 'bg-wellness-mint hover:bg-green-300' },
];

interface MoodSelectorProps {
  selectedMood?: number;
  onMoodSelect: (mood: number) => void;
}

const MoodSelector = ({ selectedMood, onMoodSelect }: MoodSelectorProps) => {
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleMoodSelect = async (mood: number) => {
    // Appeler la fonction parent immédiatement
    onMoodSelect(mood);
    
    // Sauvegarder dans la base de données
    setSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const moodData = {
        date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
        mood_level: mood,
        mood_emoji: moodOptions.find(option => option.value === mood)?.emoji || '😐',
        energy_level: 5, // Valeur par défaut moyenne
        stress_level: 3, // Valeur par défaut moyenne
        sleep_quality: null, // Optionnel
        notes: null, // Optionnel
        activities: [], // Tableau vide par défaut
        emotions: [] // Tableau vide par défaut
      };

      await apiService.healthData.saveMoodData(moodData);
      setSaveStatus('success');
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      setSaveStatus('error');
      setErrorMessage(error.message || 'Erreur lors de la sauvegarde');
      console.error('Erreur sauvegarde humeur:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6 glass-card border-0 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-center">
        Comment vous sentez-vous aujourd'hui ?
      </h3>
      
      {/* Messages de statut */}
      {saveStatus === 'success' && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Humeur sauvegardée avec succès !
          </AlertDescription>
        </Alert>
      )}
      
      {saveStatus === 'error' && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-5 gap-2">
        {moodOptions.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood.value)}
            disabled={saving}
            className={`
              flex flex-col items-center p-3 rounded-2xl transition-all duration-200 
              ${mood.color}
              ${selectedMood === mood.value 
                ? 'ring-2 ring-primary ring-offset-2 scale-105' 
                : 'hover:scale-110'
              }
              ${saving ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {saving && selectedMood === mood.value ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            ) : (
              <span className="text-2xl mb-1">{mood.emoji}</span>
            )}
            <span className="text-xs text-center font-medium">
              {mood.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default MoodSelector;
