import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import MobilePageShell from '@/components/MobilePageShell';

const PositiveMoodMotivationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { mood?: number } | undefined;

  return (
    <MobilePageShell gradient="emerald">
      <div className="space-y-6">
        <Card className="p-8 text-center shadow-xl border-emerald-100">
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <ThumbsUp className="h-14 w-14 text-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-bold text-emerald-700 leading-snug">
              Ne lâche rien, tu es sur la bonne voie! Bravo!
            </h1>
            <p className="text-emerald-900/80 text-sm md:text-base max-w-md">
              On consolide ces bons ressentis pour nourrir ta progression durablement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full mt-2">
              <Button
                variant="outline"
                className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={() => navigate(-1)}
              >Retour</Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => navigate('/mood-positive-reflection', { state: { mood: state?.mood } })}
              >Continuer</Button>
            </div>
          </div>
        </Card>
      </div>
    </MobilePageShell>
  );
};

export default PositiveMoodMotivationPage;
