
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Clock, Video, MapPin, Phone, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HealthSpecialist {
  id: string;
  name: string;
  specialty: string;
  price: string;
  consultationType: 'video' | 'inPerson' | 'both';
}

interface BookingPageProps {
  specialist?: HealthSpecialist;
  onBack: () => void;
  onBookingConfirmed?: (booking: any) => void;
}

const BookingPage = ({ specialist, onBack, onBookingConfirmed }: BookingPageProps) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newBooking = {
      id: Date.now().toString(),
      specialistName: specialist?.name || '',
      specialty: specialist?.specialty || '',
      date: selectedDate,
      time: selectedTime,
      type: consultationType as 'video' | 'inPerson' | 'phone',
      status: 'confirmed' as const,
      price: specialist?.price || '',
      notes
    };

    // Sauvegarder dans localStorage
    const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const updatedBookings = [...existingBookings, newBooking];
    localStorage.setItem('userBookings', JSON.stringify(updatedBookings));

    // Appeler la callback si fournie
    if (onBookingConfirmed) {
      onBookingConfirmed(newBooking);
    }

    toast({
      title: "Réservation confirmée",
      description: `Votre rendez-vous avec ${specialist?.name} est confirmé pour le ${new Date(selectedDate).toLocaleDateString()} à ${selectedTime}.`,
    });

    onBack();
  };

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  if (!specialist) return null;

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
        <h1 className="text-2xl font-bold">Réserver avec {specialist.name}</h1>
      </div>

      {/* Informations du spécialiste */}
      <div className="bg-wellness-gradient rounded-2xl p-4 text-white">
        <h2 className="text-lg font-semibold">{specialist.name}</h2>
        <p className="text-white/90">{specialist.specialty}</p>
        <p className="text-white/80 text-sm mt-1">{specialist.price}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-base font-medium">Date souhaitée</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time" className="text-base font-medium">Heure</Label>
          <Select value={selectedTime} onValueChange={setSelectedTime} required>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Choisir un créneau" />
            </SelectTrigger>
            <SelectContent>
              {availableTimes.map((time) => (
                <SelectItem key={time} value={time}>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{time}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" className="text-base font-medium">Type de consultation</Label>
          <Select value={consultationType} onValueChange={setConsultationType} required>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Choisir le type" />
            </SelectTrigger>
            <SelectContent>
              {(specialist.consultationType === 'both' || specialist.consultationType === 'video') && (
                <SelectItem value="video">
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4" />
                    <span>Visioconférence</span>
                  </div>
                </SelectItem>
              )}
              {(specialist.consultationType === 'both' || specialist.consultationType === 'inPerson') && (
                <SelectItem value="inPerson">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>En présentiel</span>
                  </div>
                </SelectItem>
              )}
              <SelectItem value="phone">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Téléphone</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-base font-medium">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            placeholder="Décrivez brièvement votre situation ou vos questions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="text-base"
          />
        </div>

        <div className="space-y-3 pt-4">
          <Button type="submit" className="w-full h-14 bg-wellness-gradient hover:opacity-90 text-lg font-semibold">
            <Check className="h-5 w-5 mr-2" />
            Confirmer la réservation
          </Button>
          <Button type="button" variant="outline" onClick={onBack} className="w-full h-12">
            Annuler
          </Button>
        </div>
      </form>

      {/* Espace pour éviter que le contenu soit caché par la navbar */}
      <div className="h-20" />
    </div>
  );
};

export default BookingPage;
