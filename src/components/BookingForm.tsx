
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Euro, 
  X,
  Video,
  MapPin,
  MessageCircle
} from 'lucide-react';
import { HealthProfessional } from './HealthProfessionalCard';

interface BookingFormProps {
  professional: HealthProfessional;
  onBook: (bookingData: BookingData) => void;
  onCancel: () => void;
}

export interface BookingData {
  professionalId: string;
  date: Date;
  time: string;
  consultationType: 'video' | 'inPerson' | 'phone';
  reason: string;
  notes?: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  professional, 
  onBook, 
  onCancel 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'video' | 'inPerson' | 'phone'>('video');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime && reason.trim() && contactInfo.name && contactInfo.email) {
      onBook({
        professionalId: professional.id,
        date: selectedDate,
        time: selectedTime,
        consultationType,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        contactInfo
      });
    }
  };

  const handleConsultationTypeChange = (value: string) => {
    setConsultationType(value as 'video' | 'inPerson' | 'phone');
  };

  const canSubmit = selectedDate && selectedTime && reason.trim() && 
                   contactInfo.name && contactInfo.email;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={professional.avatar} alt={professional.name} />
              <AvatarFallback className="bg-purple-100 dark:bg-purple-800">
                {professional.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{professional.name}</CardTitle>
              <p className="text-purple-600 dark:text-purple-400 text-sm">
                {professional.specialty}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Choisir une date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border"
              />
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-2">
                <Label>Heure disponible</Label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                      className="text-sm"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Consultation Type */}
            <div className="space-y-2">
              <Label>Type de consultation</Label>
              <Select value={consultationType} onValueChange={handleConsultationTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {professional.consultationTypes.includes('video') && (
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Consultation vidéo
                      </div>
                    </SelectItem>
                  )}
                  {professional.consultationTypes.includes('inPerson') && (
                    <SelectItem value="inPerson">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Consultation présentielle
                      </div>
                    </SelectItem>
                  )}
                  {professional.consultationTypes.includes('phone') && (
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Consultation téléphonique
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <Label>Informations de contact</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Votre nom complet"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Votre numéro de téléphone"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Motif de consultation *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Décrivez brièvement le motif de votre consultation..."
                className="min-h-[80px]"
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes additionnelles (optionnel)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informations supplémentaires..."
                className="min-h-[60px]"
              />
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total de la consultation</span>
                <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                  <Euro className="w-5 h-5" />
                  {professional.price}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={!canSubmit}
                className="flex-1 bg-wellness-gradient hover:opacity-90 text-white"
              >
                Confirmer la réservation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingForm;
