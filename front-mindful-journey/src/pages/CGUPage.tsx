import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Scale } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CGUPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back', 'Retour')}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-emerald-600" />
              {t('legal.cguTitle', "Conditions Générales d'Utilisation")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-emerald max-w-none">
              <h2>1. Objet</h2>
              <p>
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la 
                plateforme JoyatWork, accessible via le site web et l'application mobile.
              </p>

              <h2>2. Acceptation des conditions</h2>
              <p>
                L'utilisation de JoyatWork implique l'acceptation pleine et entière des présentes CGU. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
              </p>

              <h2>3. Description des services</h2>
              <p>JoyatWork propose :</p>
              <ul>
                <li>Un suivi personnalisé du bien-être au travail</li>
                <li>Des exercices de méditation et de respiration</li>
                <li>Des défis bien-être quotidiens</li>
                <li>Un auto-diagnostic de votre état émotionnel</li>
                <li>Des recommandations personnalisées</li>
                <li>La mise en relation avec des praticiens certifiés</li>
              </ul>

              <h2>4. Inscription et compte utilisateur</h2>
              <p>
                Pour accéder aux services, vous devez créer un compte en fournissant des informations 
                exactes et complètes. Vous êtes responsable de la confidentialité de vos identifiants.
              </p>

              <h2>5. Obligations de l'utilisateur</h2>
              <p>L'utilisateur s'engage à :</p>
              <ul>
                <li>Utiliser le service de manière conforme aux lois en vigueur</li>
                <li>Ne pas tenter de nuire au fonctionnement de la plateforme</li>
                <li>Respecter les droits de propriété intellectuelle</li>
                <li>Ne pas diffuser de contenu illicite ou offensant</li>
              </ul>

              <h2>6. Propriété intellectuelle</h2>
              <p>
                L'ensemble du contenu de JoyatWork (textes, images, logos, exercices, méditations) 
                est protégé par le droit de la propriété intellectuelle. Toute reproduction non 
                autorisée est interdite.
              </p>

              <h2>7. Limitation de responsabilité</h2>
              <p>
                JoyatWork ne saurait être tenu responsable des dommages directs ou indirects résultant 
                de l'utilisation ou de l'impossibilité d'utiliser le service. Les conseils fournis ne 
                remplacent pas un avis médical professionnel.
              </p>

              <h2>8. Modification des CGU</h2>
              <p>
                JoyatWork se réserve le droit de modifier les présentes CGU à tout moment. 
                Les utilisateurs seront informés de toute modification significative.
              </p>

              <h2>9. Résiliation</h2>
              <p>
                Vous pouvez résilier votre compte à tout moment depuis les paramètres de votre profil. 
                JoyatWork peut également suspendre ou résilier votre compte en cas de violation des CGU.
              </p>

              <h2>10. Droit applicable</h2>
              <p>
                Les présentes CGU sont soumises au droit français. Tout litige sera soumis aux 
                tribunaux compétents de Paris.
              </p>

              <h2>11. Contact</h2>
              <p>
                Pour toute question concernant les CGU : 
                <a href="mailto:contact@joyatwork.fr" className="text-emerald-600"> contact@joyatwork.fr</a>
              </p>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-500 mb-4">
                {t('legal.downloadFull', 'Télécharger le document complet :')}
              </p>
              <a href="/legal/cgu.pdf" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {t('legal.downloadPDF', 'Télécharger le PDF')}
                </Button>
              </a>
            </div>

            <div className="border-t pt-6 text-sm text-gray-500">
              <p>{t('legal.lastUpdate', 'Dernière mise à jour')} : 16 février 2024</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link to="/cookies" className="hover:text-emerald-600">
            {t('legal.cookiePolicy', 'Politique de cookies')}
          </Link>
          {' • '}
          <Link to="/confidentialite" className="hover:text-emerald-600">
            {t('legal.privacyPolicy', 'Politique de confidentialité')}
          </Link>
          {' • '}
          <Link to="/mentions-legales" className="hover:text-emerald-600">
            {t('legal.legalNotices', 'Mentions légales')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CGUPage;
