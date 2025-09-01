
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface DiagnosticQuestion {
  id: string;
  question: string;
  type: 'slider' | 'emoji' | 'choice' | 'text';
  options?: string[];
  min?: number;
  max?: number;
  labels?: { min: string; max: string };
  description?: string; // texte additionnel facultatif
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
  hidePreviousButton?: boolean;
  primaryLabel?: string; // force un libellé personnalisé (ex: Ok)
  previousLabel?: string; // personnalisation éventuelle
  inlineBackArrow?: boolean; // afficher une petite flèche retour à côté du bouton principal
}

const DiagnosticStep = ({
  question,
  currentStep,
  totalSteps,
  value,
  onValueChange,
  onNext,
  onPrevious,
  canGoNext,
  hidePreviousButton,
  primaryLabel,
  previousLabel,
  inlineBackArrow
}: DiagnosticStepProps) => {
  const [animatingChoice, setAnimatingChoice] = useState<any>(null);
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
            {emojiOptions.map((option) => {
              const active = value === option.value;
              const animate = animatingChoice === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onValueChange(option.value);
                    setAnimatingChoice(option.value);
                    setTimeout(() => setAnimatingChoice(null), 420);
                  }}
                  className={`
                    flex flex-col items-center p-4 rounded-2xl transition-transform duration-200
                    ${active
                      ? 'bg-wellness-gradient text-white shadow-lg' 
                      : 'bg-gray-50 hover:bg-gray-100'}
                    ${animate ? 'animate-selectPulse' : ''}
                  `}
                >
                  <span className="text-3xl mb-2">{option.emoji}</span>
                  <span className="text-xs text-center font-medium">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case 'choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const active = value === option;
              const animate = animatingChoice === option;
              return (
                <button
                  key={index}
                  onClick={() => {
                    onValueChange(option);
                    setAnimatingChoice(option);
                    setTimeout(() => setAnimatingChoice(null), 420);
                  }}
                  className={`
                    w-full p-4 rounded-lg text-left transition-all duration-200 border relative
                    ${active
                      ? 'border-primary bg-primary/5 text-primary shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                    ${animate ? 'animate-selectPulse' : ''}
                  `}
                >
                  {option}
                </button>
              );
            })}
          </div>
        );

      case 'text':
        return (
          <div>
            <textarea
              placeholder={"Répondez ici..."}
              value={value || ''}
              onChange={(e) => onValueChange(e.target.value)}
              className="w-full h-40 resize-none rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/40 p-4 text-sm leading-relaxed bg-white/70 backdrop-blur"
            />
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
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold leading-relaxed whitespace-pre-line">
            {question.question}
          </h2>
          {question.description && (
            <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">
              {question.description}
            </p>
          )}
        </div>

        <div className="mb-8">
          {renderInput()}
        </div>

        <div className={`flex items-center gap-3 ${hidePreviousButton ? (inlineBackArrow ? 'justify-between' : 'justify-end') : 'justify-between'}`}>
          {!hidePreviousButton && (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{previousLabel || 'Précédent'}</span>
            </Button>
          )}
          {hidePreviousButton && inlineBackArrow && currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              className="h-10 w-10 p-0 flex items-center justify-center bg-wellness-gradient text-white border-0 shadow hover:opacity-90 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1" />
          <Button
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center space-x-2 bg-wellness-gradient hover:opacity-90"
          >
            <span>{primaryLabel || (currentStep === totalSteps ? 'Terminer' : 'Suivant')}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DiagnosticStep;
