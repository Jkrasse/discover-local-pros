import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Settings } from 'lucide-react';

export type CookieConsent = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

const defaultConsent: CookieConsent = {
  necessary: true, // Always required
  analytics: false,
  marketing: false,
  timestamp: 0,
};

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);

  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookieConsent;
        setConsent(parsed);
        setIsVisible(false);
      } catch {
        setIsVisible(true);
      }
    } else {
      // Small delay before showing banner
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (newConsent: CookieConsent) => {
    const consentWithTimestamp = { ...newConsent, timestamp: Date.now() };
    localStorage.setItem('cookie-consent', JSON.stringify(consentWithTimestamp));
    setConsent(consentWithTimestamp);
    setIsVisible(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    });
  };

  const saveCustom = () => {
    saveConsent(consent);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-fade-in-up">
      <div className="container max-w-4xl">
        <div className="bg-background border border-border rounded-xl shadow-elevated p-6">
          {!showDetails ? (
            // Simple view
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Vi använder cookies 🍪
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Vi använder cookies för att förbättra din upplevelse på webbplatsen och för att 
                    analysera hur webbplatsen används. Läs mer i vår{' '}
                    <Link to="/cookies" className="text-accent hover:underline">
                      cookiepolicy
                    </Link>.
                  </p>
                </div>
                <button
                  onClick={acceptNecessary}
                  className="text-muted-foreground hover:text-foreground p-1"
                  aria-label="Stäng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={acceptAll}
                  className="bg-accent hover:bg-accent/90"
                >
                  Godkänn alla
                </Button>
                <Button
                  onClick={acceptNecessary}
                  variant="outline"
                >
                  Endast nödvändiga
                </Button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Anpassa
                </button>
              </div>
            </div>
          ) : (
            // Detailed view
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-foreground">
                  Cookie-inställningar
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-muted-foreground hover:text-foreground p-1"
                  aria-label="Tillbaka"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Necessary */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Nödvändiga cookies</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Krävs för att webbplatsen ska fungera. Kan inte stängas av.
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-not-allowed">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-accent/50 rounded-full peer-checked:bg-accent"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
                  </label>
                </div>

                {/* Analytics */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Analyscookies</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hjälper oss förstå hur besökare använder webbplatsen (Google Analytics).
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer-checked:bg-accent transition-colors"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5 shadow-sm"></div>
                  </label>
                </div>

                {/* Marketing */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Marknadsföringscookies</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Används för att visa relevanta annonser (Meta, Google Ads).
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted rounded-full peer-checked:bg-accent transition-colors"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5 shadow-sm"></div>
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={saveCustom}
                  className="bg-accent hover:bg-accent/90"
                >
                  Spara inställningar
                </Button>
                <Button
                  onClick={acceptAll}
                  variant="outline"
                >
                  Godkänn alla
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Läs mer i vår{' '}
                <Link to="/cookies" className="text-accent hover:underline">
                  cookiepolicy
                </Link>{' '}
                och{' '}
                <Link to="/integritetspolicy" className="text-accent hover:underline">
                  integritetspolicy
                </Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to check consent status
export function useCookieConsent(): CookieConsent | null {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent');
    if (stored) {
      try {
        setConsent(JSON.parse(stored));
      } catch {
        setConsent(null);
      }
    }
  }, []);

  return consent;
}
