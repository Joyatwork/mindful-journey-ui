
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Video, MapPin, Phone } from 'lucide-react';

interface HealthSpecialist {
  id: string;
  name: string;
  specialty: string;
  price: string;
  consultationType: 'video' | 'inPerson' | 'both';
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialist?: HealthSpecialist;
}

const BookingModal = ({ isOpen, onClose, specialist }: BookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de réservation
    console.log('Booking submitted:', {
      specialist: specialist?.id,
      date: selectedDate,
      time: selectedTime,
      type: consultationType,
      notes
    });
    onClose();
  };

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  if (!specialist) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto my-8 max-h-[85vh] overflow-y-auto z-[100] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Réserver avec {specialist.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {specialist.specialty} • {specialist.price}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date souhaitée</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Heure</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime} required>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un créneau" />
              </SelectTrigger>
              <SelectContent className="z-[110]">
                {availableTimes.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type de consultation</Label>
            <Select value={consultationType} onValueChange={setConsultationType} required>
              <SelectTrigger>
                <SelectValue placeholder="Choisir le type" />
              </SelectTrigger>
              <SelectContent className="z-[110]">
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
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Décrivez brièvement votre situation ou vos questions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1 bg-wellness-gradient hover:opacity-90">
              Confirmer la réservation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
