
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  X
} from 'lucide-react';

interface EditProfileFormProps {
  onSave: (data: UserProfileData) => void;
  onCancel: () => void;
  initialData: UserProfileData;
  isLoading?: boolean;
}

interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  birthDate: string;
  goals: string;
  jobPosition: string;
  company: string;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onSave, onCancel, initialData, isLoading = false }) => {
  const form = useForm<UserProfileData>({
    defaultValues: initialData
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleSubmit = (data: UserProfileData) => {
    // If avatar file present, build FormData (use snake_case keys expected by the backend)
    if (avatarFile) {
      const fd = new FormData();
      fd.append('name', data.name || '');
      fd.append('email', data.email || '');
      fd.append('phone', data.phone || '');
      fd.append('location', data.location || '');
      // backend expects birth_date
      fd.append('birth_date', data.birthDate || '');
      // backend expects job_position
      fd.append('job_position', data.jobPosition || '');
      fd.append('company', data.company || '');
      fd.append('bio', data.bio || '');
      fd.append('goals', data.goals || '');
      fd.append('avatar', avatarFile);
      onSave(fd as any);
      return;
    }

    onSave(data);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-wellness-gradient rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Modifier le profil</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-white/90 text-sm">Personnalisez vos informations</p>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
        <div className="absolute bottom-0 right-8 w-20 h-20 bg-white/5 rounded-full" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Nom complet</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom complet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Téléphone</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+33 6 12 34 56 78" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Localisation</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ville, Pays" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date de naissance</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Avatar upload */}
              <div>
                <FormLabel>Photo de profil</FormLabel>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Aperçu avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setAvatarFile(f);
                        if (f) {
                          const url = URL.createObjectURL(f);
                          setAvatarPreview(url);
                        } else {
                          setAvatarPreview(null);
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Formats: jpg, png, webp — max 5MB</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Informations professionnelles</h2>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="jobPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Poste</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Votre poste actuel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Entreprise</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Votre entreprise" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">À propos</h2>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biographie</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Parlez-nous de vous..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objectifs bien-être</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Quels sont vos objectifs de bien-être ?"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <div className="flex space-x-3">
            <Button
              type="submit"
              className="flex-1 bg-wellness-gradient hover:opacity-90 text-white"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditProfileForm;
