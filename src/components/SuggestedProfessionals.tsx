
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Heart, Moon, Zap, Users, AlertTriangle } from 'lucide-react';
import HealthProfessionalCard, { HealthProfessional } from './HealthProfessionalCard';

interface SuggestedProfessionalsProps {
  diagnosticAnswers: Record<string, any>;
  professionals: HealthProfessional[];
  onBook: (professional: HealthProfessional) => void;
  onViewAll: () => void;
}

const SuggestedProfessionals: React.FC<SuggestedProfessionalsProps> = ({
  diagnosticAnswers,
  professionals,
  onBook,
  onViewAll
}) => {
  // Fonction pour déterminer les spécialités recommandées basées sur le diagnostic
  const getRecommendedSpecialties = (): string[] => {
    const specialties: string[] = [];
    
    // Analyse du niveau de stress
    if (diagnosticAnswers.stress_level >= 7) {
      specialties.push('Psychologue', 'Psychiatre', 'Thérapeute');
    }
    
    // Analyse de la qualité du sommeil
    if (diagnosticAnswers.sleep_quality && 
        (diagnosticAnswers.sleep_quality.includes('Très mauvais') || 
         diagnosticAnswers.sleep_quality.includes('Difficile'))) {
      specialties.push('Médecin du sommeil', 'Psychiatre');
    }
    
    // Analyse du niveau d'énergie
    if (diagnosticAnswers.energy_level <= 3) {
      specialties.push('Médecin généraliste', 'Endocrinologue');
    }
    
    // Analyse de la pression au travail
    if (diagnosticAnswers.work_pressure && 
        (diagnosticAnswers.work_pressure.includes('Souvent') || 
         diagnosticAnswers.work_pressure.includes('Toujours'))) {
      specialties.push('Psychologue', 'Coach en développement personnel');
    }
    
    // Si pas de problème spécifique détecté, recommander un suivi préventif
    if (specialties.length === 0) {
      specialties.push('Médecin généraliste', 'Coach bien-être');
    }
    
    return [...new Set(specialties)]; // Enlever les doublons
  };

  // Fonction pour obtenir le message de recommandation
  const getRecommendationMessage = (): { title: string; description: string; priority: 'low' | 'medium' | 'high' } => {
    const stressLevel = diagnosticAnswers.stress_level || 0;
    const sleepIssues = diagnosticAnswers.sleep_quality && 
                       (diagnosticAnswers.sleep_quality.includes('Très mauvais') || 
                        diagnosticAnswers.sleep_quality.includes('Difficile'));
    const lowEnergy = diagnosticAnswers.energy_level <= 3;
    const workPressure = diagnosticAnswers.work_pressure && 
                        (diagnosticAnswers.work_pressure.includes('Souvent') || 
                         diagnosticAnswers.work_pressure.includes('Toujours'));

    if (stressLevel >= 8 || sleepIssues) {
      return {
        title: "Consultation recommandée",
        description: "Votre auto-évaluation suggère qu'une consultation avec un professionnel pourrait vous être bénéfique pour améliorer votre bien-être.",
        priority: 'high'
      };
    }
    
    if (stressLevel >= 6 || lowEnergy || workPressure) {
      return {
        title: "Suivi conseillé",
        description: "Il pourrait être intéressant de discuter de votre situation avec un professionnel pour développer des stratégies de bien-être.",
        priority: 'medium'
      };
    }
    
    return {
      title: "Suivi préventif",
      description: "Maintenez votre bien-être avec un suivi préventif auprès d'un professionnel de santé.",
      priority: 'low'
    };
  };

  const recommendedSpecialties = getRecommendedSpecialties();
  const recommendation = getRecommendationMessage();
  
  // Filtrer les professionnels recommandés
  const suggestedProfessionals = professionals
    .filter(prof => recommendedSpecialties.includes(prof.specialty))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3); // Limiter à 3 suggestions

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Brain className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  if (suggestedProfessionals.length === 0) {
    return (
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Professionnels disponibles
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Consultez notre liste complète de professionnels de santé disponibles.
          </p>
          <Button onClick={onViewAll} className="bg-wellness-gradient hover:opacity-90 text-white">
            Voir tous les professionnels
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Recommendation Banner */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {getPriorityIcon(recommendation.priority)}
              {recommendation.title}
            </CardTitle>
            <Badge className={getPriorityColor(recommendation.priority)}>
              Basé sur votre diagnostic
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {recommendation.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Spécialités recommandées :
            </span>
            {recommendedSpecialties.map(specialty => (
              <Badge key={specialty} variant="secondary">
                {specialty}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Professionals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Professionnels recommandés
          </h2>
          <Button variant="outline" onClick={onViewAll}>
            Voir tous
          </Button>
        </div>

        <div className="grid gap-4">
          {suggestedProfessionals.map(professional => (
            <HealthProfessionalCard
              key={professional.id}
              professional={professional}
              onBook={onBook}
              suggested={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestedProfessionals;
