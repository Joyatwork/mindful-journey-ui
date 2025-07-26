
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  MapPin, 
  Clock, 
  Euro,
  Calendar,
  Video,
  MessageCircle
} from 'lucide-react';

export interface HealthProfessional {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  location: string;
  price: number;
  availableSlots: string[];
  consultationTypes: ('video' | 'inPerson' | 'phone')[];
  bio: string;
  languages: string[];
  experience: number;
}

interface HealthProfessionalCardProps {
  professional: HealthProfessional;
  onBook: (professional: HealthProfessional) => void;
  suggested?: boolean;
}

const HealthProfessionalCard: React.FC<HealthProfessionalCardProps> = ({
  professional,
  onBook,
  suggested = false
}) => {
  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-200">
      {suggested && (
        <div className="bg-wellness-gradient text-white text-xs py-1 px-3 rounded-t-lg text-center font-medium">
          Recommandé pour vous
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="w-16 h-16 border-2 border-purple-200 dark:border-purple-700">
            <AvatarImage src={professional.avatar} alt={professional.name} />
            <AvatarFallback className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
              {professional.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {professional.name}
            </h3>
            <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">
              {professional.specialty}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {professional.rating}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({professional.reviewCount} avis)
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Euro className="w-4 h-4" />
              <span className="font-semibold">{professional.price}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">par séance</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {professional.bio}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>{professional.location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{professional.experience} ans d'expérience</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {professional.consultationTypes.map((type) => (
            <Badge key={type} variant="secondary" className="text-xs">
              {type === 'video' && <><Video className="w-3 h-3 mr-1" />Vidéo</>}
              {type === 'inPerson' && <><MapPin className="w-3 h-3 mr-1" />Présentiel</>}
              {type === 'phone' && <><MessageCircle className="w-3 h-3 mr-1" />Téléphone</>}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => onBook(professional)}
            className="flex-1 bg-wellness-gradient hover:opacity-90 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Réserver
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthProfessionalCard;
