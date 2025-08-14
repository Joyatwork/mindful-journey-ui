
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Moon, Clock, Lightbulb, Smartphone, Coffee } from 'lucide-react';

interface SleepRoutineContentProps {
  onBack: () => void;
  onComplete: () => void;
}

const SleepRoutineContent = ({ onBack, onComplete }: SleepRoutineContentProps) => {
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [currentPhase, setCurrentPhase] = useState(0);

  const routinePhases = [
    {
      title: "2 heures avant le coucher",
      time: "21h00",
      tasks: [
        {
          id: 1,
          text: "Arrêter la caféine et l'alcool",
          icon: <Coffee className="h-4 w-4" />,
          tip: "Évitez tous les stimulants pour préparer votre corps au repos"
        },
        {
          id: 2,
          text: "Diminuer la luminosité dans la maison",
          icon: <Lightbulb className="h-4 w-4" />,
          tip: "Créez une ambiance tamisée pour signaler à votre cerveau qu'il est temps de se reposer"
        }
      ]
    },
    {
      title: "1 heure avant le coucher",
      time: "22h00",
      tasks: [
        {
          id: 3,
          text: "Éteindre tous les écrans",
          icon: <Smartphone className="h-4 w-4" />,
          tip: "La lumière bleue des écrans perturbe la production de mélatonine"
        },
        {
          id: 4,
          text: "Prendre une douche tiède",
          icon: <Moon className="h-4 w-4" />,
          tip: "L'eau tiède aide à faire baisser la température corporelle"
        },
        {
          id: 5,
          text: "Préparer ses vêtements pour demain",
          icon: <Clock className="h-4 w-4" />,
          tip: "Réduisez le stress du matin en vous préparant la veille"
        }
      ]
    },
    {
      title: "30 minutes avant le coucher",
      time: "22h30",
      tasks: [
        {
          id: 6,
          text: "Lire un livre ou écrire dans un journal",
          icon: <Moon className="h-4 w-4" />,
          tip: "Activités calmes qui préparent l'esprit au repos"
        },
        {
          id: 7,
          text: "Faire quelques étirements doux",
          icon: <Moon className="h-4 w-4" />,
          tip: "Relâchez les tensions accumulées dans la journée"
        },
        {
          id: 8,
          text: "Pratiquer la respiration profonde",
          icon: <Moon className="h-4 w-4" />,
          tip: "5 minutes de respiration consciente pour calmer le système nerveux"
        }
      ]
    }
  ];

  const allTasks = routinePhases.flatMap(phase => phase.tasks);
  const progress = (completedTasks.length / allTasks.length) * 100;
  const isCompleted = completedTasks.length === allTasks.length;

  const handleTaskToggle = (taskId: number) => {
    setCompletedTasks(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleComplete = () => {
    if (isCompleted) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Retour
        </Button>
        <Badge className="bg-purple-100 text-purple-800">
          <Moon className="h-3 w-3 mr-1" />
          Sommeil
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-800">
            Routine sommeil
          </CardTitle>
          <p className="text-purple-600">
            Améliorez la qualité de votre sommeil étape par étape
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              Progression: {completedTasks.length} / {allTasks.length}
            </div>
            <Progress value={progress} className="w-full mb-4" />
          </div>

          {!isCompleted && (
            <div className="space-y-6">
              {routinePhases.map((phase, phaseIndex) => (
                <Card key={phaseIndex} className="bg-white/70">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-purple-800">
                        {phase.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        {phase.time}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {phase.tasks.map((task) => (
                      <div key={task.id} className="space-y-2">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={`task-${task.id}`}
                            checked={completedTasks.includes(task.id)}
                            onCheckedChange={() => handleTaskToggle(task.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`task-${task.id}`}
                              className={`flex items-center space-x-2 cursor-pointer ${
                                completedTasks.includes(task.id) 
                                  ? 'line-through text-gray-500' 
                                  : 'text-gray-800'
                              }`}
                            >
                              {task.icon}
                              <span className="font-medium">{task.text}</span>
                            </label>
                            <p className="text-xs text-gray-600 mt-1 ml-6">
                              {task.tip}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {isCompleted && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800 mb-1">
                  Routine terminée !
                </h3>
                <p className="text-green-600">
                  Vous êtes prêt(e) pour une bonne nuit de sommeil
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              onClick={isCompleted ? handleComplete : onBack}
              className={`px-8 rounded-full ${
                isCompleted 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white`}
              disabled={!isCompleted && completedTasks.length === 0}
            >
              {isCompleted ? "Terminer" : "Continuer plus tard"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SleepRoutineContent;
