import React from 'react';
import MobilePageShell from '@/components/MobilePageShell';
import ChallengesTableInfo from '@/components/ChallengesTableInfo';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Page pour afficher les informations détaillées de la table challenges
 */
const ChallengesInfoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MobilePageShell>
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Infos de la base de données</h1>
        </div>

        <ChallengesTableInfo />
      </div>
    </MobilePageShell>
  );
};

export default ChallengesInfoPage;
