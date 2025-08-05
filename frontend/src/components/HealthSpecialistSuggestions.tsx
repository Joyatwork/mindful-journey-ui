
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  UserCheck, 
  Star, 
  Clock, 
  Calendar,
  Video,
  MapPin
} from 'lucide-react';

interface HealthSpecialist {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  price: string;
  availability: string;
  consultationType: 'video' | 'inPerson' | 'both';
  image?: string;
  reason: string;
}

interface HealthSpecialistSuggestionsProps {
  selectedMood?: number;
  diagnosticAnswers?: Record<string, any>;
  onBookAppointment: (specialist: HealthSpecialist) => void;
  onViewProfile: (specialist: HealthSpecialist) => void;
}

const HealthSpecialistSuggestions = ({ 
  selectedMood, 
  diagnosticAnswers,
  onBookAppointment,
  onViewProfile
}: HealthSpecialistSuggestionsProps) => {
  // Logique pour suggérer des spécialistes basée sur l'humeur et le diagnostic
  const getSuggestedSpecialists = (): HealthSpecialist[] => {
    const baseSpecialists: HealthSpecialist[] = [
      {
        id: '1',
        name: 'Dr. Marie Dubois',
        specialty: 'Psychologue clinicienne',
        rating: 4.9,
        experience: '12 ans',
        price: '80€',
        availability: 'Disponible cette semaine',
        consultationType: 'both',
        reason: 'Recommandée pour la gestion du stress et de l\'anxiété'
      },
      {
        id: '2',
        name: 'Dr. Pierre Martin',
        specialty: 'Médecin généraliste',
        rating: 4.7,
        experience: '15 ans',
        price: '50€',
        availability: 'Disponible demain',
        consultationType: 'both',
        reason: 'Spécialisé dans les troubles du sommeil'
      },
      {
        id: '3',
        name: 'Dr. Sophie Laurent',
        specialty: 'Psychiatre',
        rating: 4.8,
        experience: '10 ans',
        price: '120€',
        availability: 'Disponible dans 3 jours',
        consultationType: 'video',
        reason: 'Experte en thérapies comportementales'
      }
    ];

    let filtered = baseSpecialists;
    
    if (selectedMood && selectedMood <= 2) {
      filtered = baseSpecialists.filter(s => 
        s.specialty.includes('Psychologue') || s.specialty.includes('Psychiatre')
      );
    }
    
    if (diagnosticAnswers?.sleep_quality?.includes('Très mauvais')) {
      filtered = baseSpecialists.filter(s => 
        s.specialty.includes('généraliste') || s.reason.includes('sommeil')
      );
    }

    return filtered.slice(0, 2);
  };

  const suggestedSpecialists = getSuggestedSpecialists();

  if (suggestedSpecialists.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Spécialistes recommandés</h2>
        <Button variant="ghost" size="sm">Voir tout</Button>
      </div>
      
      <div className="space-y-4">
        {suggestedSpecialists.map((specialist) => (
          <Card 
            key={specialist.id} 
            className="p-4 glass-card border-0 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => onViewProfile(specialist)}
          >
            <div className="flex items-start space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={specialist.image} alt={specialist.name} />
                <AvatarFallback className="bg-wellness-gradient text-white">
                  {specialist.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">{specialist.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-muted-foreground">{specialist.rating}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{specialist.specialty}</p>
                
                <p className="text-xs text-wellness-lavender mb-3">{specialist.reason}</p>
                
                <div className="flex items-center space-x-4 mb-3 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <UserCheck className="h-3 w-3" />
                    <span>{specialist.experience}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{specialist.availability}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {specialist.consultationType === 'video' ? (
                      <Video className="h-3 w-3" />
                    ) : specialist.consultationType === 'inPerson' ? (
                      <MapPin className="h-3 w-3" />
                    ) : (
                      <>
                        <Video className="h-3 w-3" />
                        <MapPin className="h-3 w-3" />
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {specialist.price}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookAppointment(specialist);
                    }}
                    className="bg-wellness-gradient hover:opacity-90 text-white h-8 px-3 text-xs"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Réserver
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HealthSpecialistSuggestions;
