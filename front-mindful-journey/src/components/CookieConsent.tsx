import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Cookie, X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'joyatwork_cookie_consent';

interface CookieConsentProps {
  className?: string;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Petit délai pour ne pas bloquer le rendu initial
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ 
      accepted: true, 
      date: new Date().toISOString(),
      analytics: true,
      marketing: false 
    }));
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ 
      accepted: true, 
      date: new Date().toISOString(),
      analytics: false,
      marketing: false 
    }));
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ 
      accepted: false, 
      date: new Date().toISOString(),
      analytics: false,
      marketing: false 
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${className}`}>
      <Card className="max-w-4xl mx-auto p-4 md:p-6 bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-emerald-100">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="flex-shrink-0 hidden md:block">
            <Cookie className="h-10 w-10 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Cookie className="h-5 w-5 text-emerald-600 md:hidden" />
              {t('cookies.title', 'Nous utilisons des cookies')}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {t('cookies.description', 
                "JoyatWork utilise des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. " +
                "En cliquant sur \"Accepter\", vous consentez à l'utilisation de tous les cookies."
              )}
            </p>
            <p className="text-xs text-gray-500">
              {t('cookies.learnMore', 'En savoir plus dans notre')}{' '}
              <Link to="/cookies" className="text-emerald-600 hover:underline">
                {t('cookies.cookiePolicy', 'Politique de cookies')}
              </Link>
              {' '}{t('cookies.and', 'et')}{' '}
              <Link to="/confidentialite" className="text-emerald-600 hover:underline">
                {t('cookies.privacyPolicy', 'Politique de confidentialité')}
              </Link>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="text-gray-600"
            >
              {t('cookies.decline', 'Refuser')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcceptEssential}
              className="border-emerald-200 text-emerald-700"
            >
              {t('cookies.essentialOnly', 'Essentiels uniquement')}
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {t('cookies.acceptAll', 'Tout accepter')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;
