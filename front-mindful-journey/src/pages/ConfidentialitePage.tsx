import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ConfidentialitePage: React.FC = () => {
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
              <Shield className="h-6 w-6 text-emerald-600" />
              {t('legal.privacyTitle', 'Politique de confidentialité RGPD')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-emerald max-w-none">
              <h2>1. Introduction</h2>
              <p>
                JoyatWork s'engage à protéger la vie privée de ses utilisateurs conformément au 
                Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
              </p>

              <h2>2. Responsable du traitement</h2>
              <p>
                Le responsable du traitement des données personnelles est JoyatWork SAS.
                Pour toute question, contactez-nous à : <a href="mailto:dpo@joyatwork.fr" className="text-emerald-600">dpo@joyatwork.fr</a>
              </p>

              <h2>3. Données collectées</h2>
              <p>Nous collectons les données suivantes :</p>
              <ul>
                <li><strong>Données d'identification</strong> : nom, prénom, email</li>
                <li><strong>Données de bien-être</strong> : humeur, niveau de stress, activités</li>
                <li><strong>Données d'usage</strong> : navigation, préférences, défis complétés</li>
                <li><strong>Données techniques</strong> : adresse IP, type de navigateur</li>
              </ul>

              <h2>4. Finalités du traitement</h2>
              <p>Vos données sont traitées pour :</p>
              <ul>
                <li>Fournir et personnaliser nos services de bien-être</li>
                <li>Analyser et améliorer votre expérience utilisateur</li>
                <li>Vous envoyer des communications relatives à nos services</li>
                <li>Respecter nos obligations légales</li>
              </ul>

              <h2>5. Base légale</h2>
              <p>
                Le traitement de vos données repose sur votre consentement explicite et/ou l'exécution 
                du contrat de service entre vous et JoyatWork.
              </p>

              <h2>6. Durée de conservation</h2>
              <p>
                Vos données sont conservées pendant la durée de votre utilisation du service, 
                puis archivées conformément aux délais légaux (3 ans après la dernière activité).
              </p>

              <h2>7. Vos droits</h2>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul>
                <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
                <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format standard</li>
                <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
                <li><strong>Droit de limitation</strong> : limiter le traitement de vos données</li>
              </ul>

              <h2>8. Sécurité</h2>
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour 
                protéger vos données : chiffrement SSL/TLS, accès restreint, sauvegardes sécurisées.
              </p>

              <h2>9. Transferts de données</h2>
              <p>
                Vos données sont hébergées au sein de l'Union Européenne. En cas de transfert hors UE, 
                nous nous assurons que des garanties appropriées sont en place.
              </p>

              <h2>10. Contact</h2>
              <p>
                Pour exercer vos droits ou pour toute question, contactez notre DPO à 
                l'adresse : <a href="mailto:dpo@joyatwork.fr" className="text-emerald-600">dpo@joyatwork.fr</a>
              </p>
              <p>
                Vous pouvez également déposer une réclamation auprès de la CNIL : 
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-600"> www.cnil.fr</a>
              </p>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-gray-500 mb-4">
                {t('legal.downloadFull', 'Télécharger le document complet :')}
              </p>
              <a href="/legal/confidentialite.pdf" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {t('legal.downloadPDF', 'Télécharger le PDF')}
                </Button>
              </a>
            </div>

            <div className="border-t pt-6 text-sm text-gray-500">
              <p>{t('legal.lastUpdate', 'Dernière mise à jour')} : 15 juillet 2025</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link to="/cookies" className="hover:text-emerald-600">
            {t('legal.cookiePolicy', 'Politique de cookies')}
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

export default ConfidentialitePage;
