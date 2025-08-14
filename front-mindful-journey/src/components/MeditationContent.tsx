
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, CheckCircle, Clock, Brain } from 'lucide-react';

interface MeditationContentProps {
  onBack: () => void;
  onComplete: () => void;
}

const MeditationContent = ({ onBack, onComplete }: MeditationContentProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [isCompleted, setIsCompleted] = useState(false);

  const meditationSteps = [
    {
      title: "Préparation",
      instruction: "Installez-vous confortablement, fermez les yeux et détendez vos épaules.",
      duration: 60
    },
    {
      title: "Respiration consciente", 
      instruction: "Concentrez-vous sur votre respiration naturelle. Observez l'air qui entre et sort de vos poumons.",
      duration: 180
    },
    {
      title: "Scan corporel",
      instruction: "Portez votre attention sur chaque partie de votre corps, de la tête aux pieds.",
      duration: 240
    },
    {
      title: "Pensées et émotions",
      instruction: "Observez vos pensées sans jugement, laissez-les passer comme des nuages dans le ciel.",
      duration: 180
    },
    {
      title: "Retour en douceur",
      instruction: "Bougez doucement vos doigts et orteils, puis ouvrez lentement les yeux.",
      duration: 60
    }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((600 - timeRemaining) / 600) * 100;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setTimeRemaining(600);
    setIsCompleted(false);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setIsPlaying(false);
    onComplete();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Retour
        </Button>
        <Badge className="bg-purple-100 text-purple-800">
          <Brain className="h-3 w-3 mr-1" />
          Mindfulness
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-800">
            Méditation guidée
          </CardTitle>
          <p className="text-purple-600">
            Une séance de relaxation pour réduire le stress
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-800 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {!isCompleted && (
            <Card className="bg-white/70">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-purple-800">
                      {currentStep + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    {meditationSteps[currentStep]?.title}
                  </h3>
                </div>
                <p className="text-gray-600 ml-11">
                  {meditationSteps[currentStep]?.instruction}
                </p>
              </CardContent>
            </Card>
          )}

          {isCompleted && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800 mb-1">
                  Félicitations !
                </h3>
                <p className="text-green-600">
                  Vous avez terminé votre séance de méditation
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex space-x-3 justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              className="rounded-full"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={isCompleted ? onBack : handlePlayPause}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 rounded-full"
            >
              {isCompleted ? (
                "Terminé"
              ) : isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Commencer
                </>
              )}
            </Button>
            
            {!isCompleted && (
              <Button
                variant="ghost"
                onClick={handleComplete}
                className="text-gray-600"
              >
                Terminer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeditationContent;
