import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MentionsLegalesPage: React.FC = () => {
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
              <Building2 className="h-6 w-6 text-emerald-600" />
              {t('legal.legalNoticesTitle', 'Mentions Légales')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-emerald max-w-none">
              <h2>1. Éditeur du site</h2>
              <p>
                <strong>JoyatWork</strong><br />
                Société par Actions Simplifiée (SAS)<br />
                Capital social : [À compléter]<br />
                RCS : [Numéro d'immatriculation]<br />
                Siège social : [Adresse complète]<br />
                N° TVA intracommunautaire : [Numéro TVA]
              </p>
              <p>
                <strong>Directeur de la publication :</strong> [Nom du directeur]<br />
                <strong>Email :</strong> <a href="mailto:contact@joyatwork.fr">contact@joyatwork.fr</a>
              </p>

              <h2>2. Hébergement</h2>
              <h3>Site web</h3>
              <p>
                <strong>Vercel Inc.</strong><br />
                440 N Barranca Ave #4133<br />
                Covina, CA 91723, États-Unis<br />
                Site : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">https://vercel.com</a>
              </p>
              <h3>Infrastructure back-end</h3>
              <p>
                <strong>Railway</strong><br />
                Site : <a href="https://railway.app" target="_blank" rel="noopener noreferrer">https://railway.app</a>
              </p>
              <h3>Base de données</h3>
              <p>
                <strong>Aiven</strong><br />
                Site : <a href="https://aiven.io" target="_blank" rel="noopener noreferrer">https://aiven.io</a>
              </p>

              <h2>3. Propriété intellectuelle</h2>
              <p>
                L'ensemble du contenu de ce site (textes, images, vidéos, sons, graphismes, logos, 
                icônes, et sa mise en forme) est la propriété exclusive de JoyatWork ou de ses 
                partenaires, et est protégé par les lois françaises et internationales relatives 
                à la propriété intellectuelle.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication, adaptation de tout 
                ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est 
                interdite, sauf autorisation écrite préalable de JoyatWork.
              </p>

              <h2>4. Protection des données personnelles</h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi 
                Informatique et Libertés, vous disposez de droits sur vos données personnelles. 
                Pour plus d'informations, consultez notre{' '}
                <Link to="/confidentialite" className="text-emerald-600">
                  Politique de Confidentialité
                </Link>.
              </p>
              <p>
                <strong>Délégué à la Protection des Données (DPO) :</strong><br />
                Email : <a href="mailto:dpo@joyatwork.fr">dpo@joyatwork.fr</a>
              </p>

              <h2>5. Cookies</h2>
              <p>
                Ce site utilise des cookies pour améliorer l'expérience utilisateur. Pour plus 
                d'informations sur l'utilisation des cookies, consultez notre{' '}
                <Link to="/cookies" className="text-emerald-600">
                  Politique de Cookies
                </Link>.
              </p>

              <h2>6. Limitation de responsabilité</h2>
              <p>
                Les informations contenues sur ce site sont aussi précises que possible et le site 
                est périodiquement mis à jour, mais peut toutefois contenir des inexactitudes, des 
                omissions ou des lacunes.
              </p>
              <p>
                JoyatWork ne pourra être tenu responsable des dommages directs et indirects causés 
                au matériel de l'utilisateur, lors de l'accès au site.
              </p>

              <h2>7. Droit applicable</h2>
              <p>
                Le présent site et son contenu sont régis par le droit français. Tout litige relatif 
                à l'utilisation du site sera soumis à la compétence exclusive des tribunaux français.
              </p>

              <h2>8. Contact</h2>
              <p>
                Pour toute question concernant les mentions légales :{' '}
                <a href="mailto:contact@joyatwork.fr" className="text-emerald-600">
                  contact@joyatwork.fr
                </a>
              </p>
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
          <Link to="/cgu" className="hover:text-emerald-600">
            {t('legal.termsOfUse', "Conditions d'utilisation")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegalesPage;
