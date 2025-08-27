import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import apiService from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Practitioner {
  id?: string;
  name?: string;
  specialty?: string;
  consultationType?: 'video' | 'inPerson' | 'both';
  price?: string | number;
}

interface Props {
  practitioner: Practitioner;
  onCancel: () => void;
  onBack: () => void;
}

const PractitionerBookingInline: React.FC<Props> = ({ practitioner, onCancel, onBack }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const times = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30'];

  const availableModes: Array<{ value: string; label: string; } > = [];
  if (practitioner.consultationType === 'video' || practitioner.consultationType === 'both') availableModes.push({ value: 'video', label: 'Visio' });
  if (practitioner.consultationType === 'inPerson' || practitioner.consultationType === 'both') availableModes.push({ value: 'inPerson', label: 'Présentiel' });
  availableModes.push({ value: 'phone', label: 'Téléphone' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !mode || !practitioner.id) return;
    setSubmitting(true);
    try {
      await apiService.appointments.create({
        specialistId: practitioner.id,
        date,
        time,
        type: mode,
        notes: notes || undefined,
      });
      toast({ title: 'Rendez-vous réservé', description: `${date} à ${time}` });
      onCancel();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Erreur lors de la réservation';
      toast({ title: 'Échec', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 text-sm">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
        </div>
        <div className="space-y-1.5">
          <Label>Heure</Label>
          <Select value={time} onValueChange={setTime} required>
            <SelectTrigger className="h-9"><SelectValue placeholder="Choisir" /></SelectTrigger>
            <SelectContent>{times.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
            <Select value={mode} onValueChange={setMode} required>
              <SelectTrigger className="h-9"><SelectValue placeholder="Mode" /></SelectTrigger>
              <SelectContent>{availableModes.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Notes (optionnel)</Label>
        <Textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Contexte, objectifs..." />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">Retour</Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 sm:flex-none">Annuler</Button>
  <Button type="submit" disabled={submitting || !date || !time || !mode || !practitioner.id} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">{submitting ? 'Envoi...' : 'Confirmer'}</Button>
      </div>
    </form>
  );
};

export default PractitionerBookingInline;
