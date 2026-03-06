
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, CheckCircle, Heart } from 'lucide-react';

interface BreathingContentProps {
  onBack: () => void;
  onComplete: () => void;
}

const BreathingContent = ({ onBack, onComplete }: BreathingContentProps) => {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [timeInPhase, setTimeInPhase] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const breathingPattern = {
    inhale: 4,
    hold: 7,
    exhale: 8,
    rest: 1
  };

  const totalCycles = 5;
  const progress = (cycleCount / totalCycles) * 100;

  const phaseTexts = {
    inhale: t('breathing.phaseTexts.inhale'),
    hold: t('breathing.phaseTexts.hold'),
    exhale: t('breathing.phaseTexts.exhale'),
    rest: t('breathing.phaseTexts.rest')
  };

  const phaseColors = {
    inhale: "bg-blue-500",
    hold: "bg-yellow-500", 
    exhale: "bg-green-500",
    rest: "bg-gray-400"
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && !isCompleted) {
      interval = setInterval(() => {
        setTimeInPhase(prev => {
          const currentPhaseDuration = breathingPattern[phase];
          
          if (prev >= currentPhaseDuration - 1) {
            // Move to next phase
            switch (phase) {
              case 'inhale':
                setPhase('hold');
                break;
              case 'hold':
                setPhase('exhale');
                break;
              case 'exhale':
                setPhase('rest');
                break;
              case 'rest':
                setPhase('inhale');
                setCycleCount(count => {
                  const newCount = count + 1;
                  if (newCount >= totalCycles) {
                    setIsCompleted(true);
                    setIsActive(false);
                    onComplete();
                  }
                  return newCount;
                });
                break;
            }
            return 0;
          }
          
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, phase, isCompleted, onComplete]);

  const handlePlayPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCycleCount(0);
    setTimeInPhase(0);
    setIsCompleted(false);
  };

  const circleSize = phase === 'inhale' ? 'scale-150' : phase === 'exhale' ? 'scale-75' : 'scale-100';

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          {t('breathing.back')}
        </Button>
        <Badge className="bg-red-100 text-red-800">
          <Heart className="h-3 w-3 mr-1" />
          {t('breathing.stressManagement')}
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-800">
            {t('breathing.title')}
          </CardTitle>
          <p className="text-red-600">
            {t('breathing.technique478')}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              {t('breathing.cycle')} {cycleCount + 1} / {totalCycles}
            </div>
            <Progress value={progress} className="w-full mb-4" />
          </div>

          {!isCompleted && (
            <div className="text-center">
              <div className={`w-32 h-32 rounded-full ${phaseColors[phase]} mx-auto mb-4 transition-all duration-1000 ${circleSize} flex items-center justify-center`}>
                <div className="text-white font-bold text-lg">
                  {breathingPattern[phase] - timeInPhase}
                </div>
              </div>
              
              <div className="text-xl font-semibold text-gray-800 mb-2">
                {phaseTexts[phase]}
              </div>
              
              <div className="text-sm text-gray-600">
                {phase === 'inhale' && t('breathing.instructions.inhale')}
                {phase === 'hold' && t('breathing.instructions.hold')}
                {phase === 'exhale' && t('breathing.instructions.exhale')}
                {phase === 'rest' && t('breathing.instructions.rest')}
              </div>
            </div>
          )}

          {isCompleted && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800 mb-1">
                  {t('breathing.excellentWork')}
                </h3>
                <p className="text-green-600">
                  {t('breathing.completedExercises')}
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
              className="bg-red-600 hover:bg-red-700 text-white px-8 rounded-full"
            >
              {isCompleted ? (
                t('breathing.finished')
              ) : isActive ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  {t('breathing.pause')}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  {t('breathing.start')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BreathingContent;
