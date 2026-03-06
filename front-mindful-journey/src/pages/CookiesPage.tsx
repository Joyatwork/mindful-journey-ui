import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CookiesPage: React.FC = () => {
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
              <FileText className="h-6 w-6 text-emerald-600" />
              {t('legal.cookiesTitle', 'Politique de gestion des cookies')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-emerald max-w-none">
              <h2>1. Qu'est-ce qu'un cookie ?</h2>
              <p>
                Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) 
                lors de votre visite sur notre site. Il permet de stocker des informations relatives à votre 
                navigation et de vous reconnaître lors de vos visites ultérieures.
              </p>

              <h2>2. Types de cookies utilisés</h2>
              <h3>Cookies essentiels</h3>
              <p>
                Ces cookies sont indispensables au fonctionnement du site. Ils vous permettent d'utiliser les 
                fonctionnalités principales comme l'authentification et la navigation sécurisée.
              </p>

              <h3>Cookies de performance</h3>
              <p>
                Ces cookies collectent des informations anonymes sur la façon dont vous utilisez notre site 
                (pages visitées, temps passé, erreurs éventuelles). Ils nous aident à améliorer nos services.
              </p>

              <h3>Cookies de fonctionnalité</h3>
              <p>
                Ces cookies mémorisent vos préférences (langue, région, paramètres d'affichage) pour 
                personnaliser votre expérience.
              </p>

              <h2>3. Gestion de vos préférences</h2>
              <p>
                Vous pouvez à tout moment modifier vos préférences en matière de cookies :
              </p>
              <ul>
                <li>Via le bandeau de consentement affiché lors de votre première visite</li>
                <li>Via les paramètres de votre navigateur</li>
                <li>En nous contactant directement</li>
              </ul>

              <h2>4. Durée de conservation</h2>
              <p>
                Les cookies sont conservés pour une durée maximale de 13 mois conformément aux 
                recommandations de la CNIL.
              </p>

              <h2>5. Contact</h2>
              <p>
                Pour toute question concernant notre politique de cookies, vous pouvez nous contacter à 
                l'adresse : <a href="mailto:contact@joyatwork.fr" className="text-emerald-600">contact@joyatwork.fr</a>
              </p>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-500 mb-4">
                {t('legal.downloadFull', 'Télécharger le document complet :')}
              </p>
              <a href="/legal/cookies.pdf" target="_blank" rel="noopener noreferrer">
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
          <Link to="/confidentialite" className="hover:text-emerald-600">
            {t('legal.privacyPolicy', 'Politique de confidentialité')}
          </Link>
          {' • '}
          <Link to="/cgu" className="hover:text-emerald-600">
            {t('legal.terms', 'Conditions générales')}
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

export default CookiesPage;
