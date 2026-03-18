import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const breadcrumbs = [
  { label: 'Hem', href: '/' },
  { label: 'Cookies' },
];

export default function CookiePolicyPage() {
  const { data: settings } = useSiteSettings();
  const siteName = settings?.site_name || 'Katalog';
  const companyName = settings?.company_name || 'Företaget AB';
  const companyAddress = settings?.company_address || 'Adress, Stad';
  const contactEmail = settings?.contact_email || 'info@example.com';

  const handleOpenCookieSettings = () => {
    localStorage.removeItem('cookie-consent');
    window.location.reload();
  };

  return (
    <Layout>
      <SEOHead
        title={`Cookiepolicy | ${siteName}`}
        description={`Information om hur ${siteName} använder cookies och liknande tekniker. Läs om vilka cookies vi använder och hur du kan hantera dem.`}
        canonical="/cookies"
      />

      <section className="bg-gradient-to-b from-primary/5 to-background pt-8 pb-12">
        <div className="container">
          <Breadcrumbs items={breadcrumbs} />
          
          <div className="mt-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Cookiepolicy
            </h1>
            <p className="text-muted-foreground">
              Senast uppdaterad: februari 2026
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto prose prose-lg prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-accent prose-strong:text-foreground">
            
            <h2>1. Vad är cookies?</h2>
            <p>
              Cookies är små textfiler som lagras på din enhet (dator, mobil, surfplatta) när 
              du besöker en webbplats. Cookies används för att webbplatsen ska fungera korrekt, 
              för att förbättra din upplevelse och för att samla in statistik om hur webbplatsen används.
            </p>

            <h2>2. Hur vi använder cookies</h2>
            <p>
              {siteName} använder cookies för följande ändamål:
            </p>
            <ul>
              <li><strong>Nödvändiga cookies:</strong> Krävs för att webbplatsen ska fungera tekniskt</li>
              <li><strong>Funktionella cookies:</strong> Sparar dina preferenser och inställningar</li>
              <li><strong>Analyscookies:</strong> Hjälper oss förstå hur besökare använder webbplatsen</li>
              <li><strong>Marknadsföringscookies:</strong> Används för att visa relevanta annonser</li>
            </ul>

            <h2>3. Cookies vi använder</h2>
            
            <h3>3.1 Nödvändiga cookies</h3>
            <p>Dessa cookies är nödvändiga för webbplatsens grundläggande funktioner och kan inte stängas av.</p>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">Cookie</th>
                  <th className="text-left p-2 border-b">Syfte</th>
                  <th className="text-left p-2 border-b">Varaktighet</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b">cookie-consent</td>
                  <td className="p-2 border-b">Sparar ditt val av cookie-inställningar</td>
                  <td className="p-2 border-b">1 år</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">supabase-auth-token</td>
                  <td className="p-2 border-b">Autentisering för inloggade användare</td>
                  <td className="p-2 border-b">Session</td>
                </tr>
              </tbody>
            </table>

            <h3>3.2 Analyscookies</h3>
            <p>Vi använder analyscookies för att förstå hur besökare interagerar med webbplatsen.</p>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">Cookie</th>
                  <th className="text-left p-2 border-b">Leverantör</th>
                  <th className="text-left p-2 border-b">Syfte</th>
                  <th className="text-left p-2 border-b">Varaktighet</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b">_ga</td>
                  <td className="p-2 border-b">Google Analytics</td>
                  <td className="p-2 border-b">Särskiljer användare</td>
                  <td className="p-2 border-b">2 år</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">_ga_*</td>
                  <td className="p-2 border-b">Google Analytics</td>
                  <td className="p-2 border-b">Bevarar sessionstillstånd</td>
                  <td className="p-2 border-b">2 år</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">_gid</td>
                  <td className="p-2 border-b">Google Analytics</td>
                  <td className="p-2 border-b">Särskiljer användare</td>
                  <td className="p-2 border-b">24 timmar</td>
                </tr>
              </tbody>
            </table>

            <h3>3.3 Marknadsföringscookies</h3>
            <p>Dessa cookies används för att visa relevanta annonser och mäta annonsers effektivitet.</p>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">Cookie</th>
                  <th className="text-left p-2 border-b">Leverantör</th>
                  <th className="text-left p-2 border-b">Syfte</th>
                  <th className="text-left p-2 border-b">Varaktighet</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b">_fbp</td>
                  <td className="p-2 border-b">Meta (Facebook)</td>
                  <td className="p-2 border-b">Spårar besök för annonsering</td>
                  <td className="p-2 border-b">3 månader</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">_gcl_au</td>
                  <td className="p-2 border-b">Google Ads</td>
                  <td className="p-2 border-b">Konverteringsspårning</td>
                  <td className="p-2 border-b">3 månader</td>
                </tr>
              </tbody>
            </table>

            <h2>4. Tredjepartscookies</h2>
            <p>
              Vissa cookies sätts av tredje parter som tillhandahåller tjänster på vår webbplats. 
              Vi har begränsad kontroll över dessa cookies. För mer information om hur dessa 
              parter hanterar dina uppgifter, se deras respektive integritetspolicyer:
            </p>
            <ul>
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
              <li><a href="https://www.facebook.com/policy.php" target="_blank" rel="noopener noreferrer">Meta Privacy Policy</a></li>
            </ul>

            <h2>5. Hantera cookies</h2>
            <p>
              Du kan när som helst ändra dina cookie-inställningar genom att klicka på knappen nedan:
            </p>
            
            <div className="not-prose my-6">
              <Button onClick={handleOpenCookieSettings} className="bg-accent hover:bg-accent/90">
                Ändra cookie-inställningar
              </Button>
            </div>

            <p>
              Du kan också hantera cookies via din webbläsare. Observera att om du blockerar 
              alla cookies kan vissa funktioner på webbplatsen sluta fungera.
            </p>
            
            <h3>Så hanterar du cookies i din webbläsare:</h3>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/sv/kb/aktivera-och-inaktivera-cookies" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/sv-se/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/sv-se/microsoft-edge/ta-bort-cookies-i-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>

            <h2>6. Samtycke</h2>
            <p>
              Första gången du besöker vår webbplats visas en cookie-banner där du kan välja 
              vilka typer av cookies du godkänner. Ditt val sparas och cookies sätts endast 
              enligt dina preferenser.
            </p>
            <p>
              Nödvändiga cookies kräver inget samtycke eftersom de är nödvändiga för att 
              webbplatsen ska fungera.
            </p>

            <h2>7. Ändringar</h2>
            <p>
              Vi kan komma att uppdatera denna cookiepolicy. Den senaste versionen finns 
              alltid tillgänglig på denna sida med angivet datum för senaste uppdatering.
            </p>

            <h2>8. Kontakt</h2>
            <p>
              Vid frågor om vår användning av cookies, kontakta oss:
            </p>
            <p>
              <strong>{companyName}</strong><br />
              {companyAddress.split(',').map((line, i) => (
                <span key={i}>{line.trim()}<br /></span>
              ))}
              E-post: {contactEmail}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
