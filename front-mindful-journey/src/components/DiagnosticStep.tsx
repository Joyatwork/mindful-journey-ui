
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface DiagnosticQuestion {
  id: string;
  question: string;
  type: 'slider' | 'emoji' | 'choice';
  options?: string[];
  min?: number;
  max?: number;
  labels?: { min: string; max: string };
}

interface DiagnosticStepProps {
  question: DiagnosticQuestion;
  currentStep: number;
  totalSteps: number;
  value: any;
  onValueChange: (value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
}

const DiagnosticStep = ({
  question,
  currentStep,
  totalSteps,
  value,
  onValueChange,
  onNext,
  onPrevious,
  canGoNext
}: DiagnosticStepProps) => {
  const emojiOptions = [
    { value: 1, emoji: '😰', label: 'Très stressé' },
    { value: 2, emoji: '😟', label: 'Stressé' },
    { value: 3, emoji: '😐', label: 'Neutre' },
    { value: 4, emoji: '😌', label: 'Calme' },
    { value: 5, emoji: '😊', label: 'Très calme' }
  ];

  const renderInput = () => {
    switch (question.type) {
      case 'slider':
        return (
          <div className="space-y-6">
            <div className="px-4">
              <Slider
                value={[value || question.min || 0]}
                onValueChange={(values) => onValueChange(values[0])}
                min={question.min || 0}
                max={question.max || 10}
                step={1}
                className="w-full"
              />
            </div>
            {question.labels && (
              <div className="flex justify-between text-sm text-muted-foreground px-2">
                <span>{question.labels.min}</span>
                <span className="font-semibold text-primary">{value || question.min || 0}</span>
                <span>{question.labels.max}</span>
              </div>
            )}
          </div>
        );

      case 'emoji':
        return (
          <div className="grid grid-cols-5 gap-3">
            {emojiOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onValueChange(option.value)}
                className={`
                  flex flex-col items-center p-4 rounded-2xl transition-all duration-200
                  ${value === option.value 
                    ? 'bg-wellness-gradient text-white scale-105 shadow-lg' 
                    : 'bg-gray-50 hover:bg-gray-100 hover:scale-105'
                  }
                `}
              >
                <span className="text-3xl mb-2">{option.emoji}</span>
                <span className="text-xs text-center font-medium">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        );

      case 'choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => onValueChange(option)}
                className={`
                  w-full p-4 rounded-lg text-left transition-all duration-200 border
                  ${value === option
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fadeIn">
      <div className="mb-6">
        <Progress 
          value={(currentStep / totalSteps) * 100} 
          className="h-2"
        />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Étape {currentStep}</span>
          <span>{totalSteps} étapes</span>
        </div>
      </div>

      <Card className="p-8 glass-card border-0 shadow-lg">
        <h2 className="text-xl font-semibold mb-6 text-center leading-relaxed">
          {question.question}
        </h2>

        <div className="mb-8">
          {renderInput()}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Précédent</span>
          </Button>

          <Button
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center space-x-2 bg-wellness-gradient hover:opacity-90"
          >
            <span>{currentStep === totalSteps ? 'Terminer' : 'Suivant'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DiagnosticStep;
