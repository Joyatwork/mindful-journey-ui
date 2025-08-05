
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

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
  return (
    <Card className="p-6 glass-card border-0 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-center">
        Comment vous sentez-vous aujourd'hui ?
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {moodOptions.map((mood) => (
          <button
            key={mood.value}
            onClick={() => onMoodSelect(mood.value)}
            className={`
              flex flex-col items-center p-3 rounded-2xl transition-all duration-200 
              ${mood.color}
              ${selectedMood === mood.value 
                ? 'ring-2 ring-primary ring-offset-2 scale-105' 
                : 'hover:scale-110'
              }
            `}
          >
            <span className="text-2xl mb-1">{mood.emoji}</span>
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
