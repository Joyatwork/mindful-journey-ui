
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  Video,
  Phone,
  Award,
  GraduationCap,
  Users,
  MessageSquare
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
  description?: string;
  education?: string[];
  languages?: string[];
  reviewCount?: number;
  nextAvailable?: string;
}

interface SpecialistProfileProps {
  specialist: HealthSpecialist;
  onBack: () => void;
  onBookAppointment: (specialist: HealthSpecialist) => void;
}

const SpecialistProfile = ({ specialist, onBack, onBookAppointment }: SpecialistProfileProps) => {
  const reviews = [
    {
      id: 1,
      author: "Marie L.",
      rating: 5,
      comment: "Très professionnelle et à l'écoute. Je recommande vivement.",
      date: "Il y a 2 semaines"
    },
    {
      id: 2,
      author: "Jean D.",
      rating: 5,
      comment: "Excellent suivi, m'a beaucoup aidé avec mes problèmes d'anxiété.",
      date: "Il y a 1 mois"
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header avec bouton retour */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Profil du spécialiste</h1>
      </div>

      {/* Informations principales */}
      <Card className="p-6 glass-card border-0 shadow-lg">
        <div className="flex items-start space-x-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={specialist.image} alt={specialist.name} />
            <AvatarFallback className="bg-wellness-gradient text-white text-xl">
              {specialist.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">{specialist.name}</h2>
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-semibold">{specialist.rating}</span>
                <span className="text-muted-foreground">({specialist.reviewCount || 24} avis)</span>
              </div>
            </div>
            
            <p className="text-lg text-wellness-lavender mb-3">{specialist.specialty}</p>
            <p className="text-muted-foreground mb-4">{specialist.reason}</p>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <GraduationCap className="h-3 w-3" />
                <span>{specialist.experience} d'expérience</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{specialist.availability}</span>
              </Badge>
              <Badge className="bg-wellness-gradient text-white">
                {specialist.price}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card className="p-6 glass-card border-0 shadow-lg">
        <h3 className="text-lg font-semibold mb-3">À propos</h3>
        <p className="text-muted-foreground leading-relaxed">
          {specialist.description || 
          `${specialist.name} est un(e) ${specialist.specialty.toLowerCase()} expérimenté(e) avec ${specialist.experience} d'expérience. Spécialisé(e) dans l'accompagnement personnalisé, ${specialist.name.split(' ')[1]} propose des consultations adaptées à chaque patient pour un suivi optimal de votre bien-être mental et physique.`}
        </p>
      </Card>

      {/* Types de consultation */}
      <Card className="p-6 glass-card border-0 shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Types de consultation</h3>
        <div className="grid grid-cols-1 gap-3">
          {(specialist.consultationType === 'both' || specialist.consultationType === 'video') && (
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50">
              <Video className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Visioconférence</p>
                <p className="text-sm text-muted-foreground">Consultation en ligne sécurisée</p>
              </div>
            </div>
          )}
          {(specialist.consultationType === 'both' || specialist.consultationType === 'inPerson') && (
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50">
              <MapPin className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">En présentiel</p>
                <p className="text-sm text-muted-foreground">Consultation au cabinet</p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50">
            <Phone className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium">Téléphone</p>
              <p className="text-sm text-muted-foreground">Consultation par téléphone</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Formation et langues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 glass-card border-0 shadow-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-wellness-lavender" />
            <span>Formation</span>
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {(specialist.education || [
              'Doctorat en Psychologie Clinique',
              'Master en Thérapies Comportementales',
              'Certification en Gestion du Stress'
            ]).map((edu, index) => (
              <li key={index} className="flex items-start space-x-2">
                <Award className="h-4 w-4 mt-0.5 text-wellness-lavender flex-shrink-0" />
                <span>{edu}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 glass-card border-0 shadow-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-wellness-lavender" />
            <span>Langues</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {(specialist.languages || ['Français', 'Anglais']).map((lang, index) => (
              <Badge key={index} variant="outline">
                {lang}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Avis récents */}
      <Card className="p-6 glass-card border-0 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-400" />
          <span>Avis récents</span>
        </h3>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{review.author}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Bouton de réservation fixe */}
      <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto">
        <Button
          onClick={() => onBookAppointment(specialist)}
          className="w-full h-14 bg-wellness-gradient hover:opacity-90 text-white text-lg font-semibold rounded-2xl shadow-lg"
        >
          <Calendar className="h-5 w-5 mr-2" />
          Prendre rendez-vous - {specialist.price}
        </Button>
      </div>

      {/* Espace pour éviter que le contenu soit caché par le bouton fixe */}
      <div className="h-20" />
    </div>
  );
};

export default SpecialistProfile;
