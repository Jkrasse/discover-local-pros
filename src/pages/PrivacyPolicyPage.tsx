import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

const breadcrumbs = [
  { label: 'Hem', href: '/' },
  { label: 'Integritetspolicy' },
];

export default function PrivacyPolicyPage() {
  return (
    <Layout>
      <SEOHead
        title="Integritetspolicy | FlyttGuide"
        description="Läs om hur FlyttGuide hanterar personuppgifter i enlighet med GDPR. Vi värnar om din integritet."
        canonical="/privacy-policy"
      />

      <section className="bg-gradient-to-b from-primary/5 to-background pt-8 pb-12">
        <div className="container">
          <Breadcrumbs items={breadcrumbs} />
          
          <div className="mt-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Integritetspolicy
            </h1>
            <p className="text-muted-foreground">
              Senast uppdaterad: januari 2026
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2>1. Introduktion</h2>
            <p>
              FlyttGuide AB ("vi", "oss", "vår") värnar om din personliga integritet. 
              Denna integritetspolicy förklarar hur vi samlar in, använder och skyddar 
              dina personuppgifter när du använder vår webbplats.
            </p>

            <h2>2. Vilka uppgifter samlar vi in?</h2>
            <h3>Uppgifter du lämnar till oss:</h3>
            <ul>
              <li>Namn och kontaktuppgifter när du fyller i vårt offertformulär</li>
              <li>E-postadress vid nyhetsbrevsprenumeration</li>
              <li>Meddelanden du skickar via kontaktformuläret</li>
            </ul>

            <h3>Uppgifter vi samlar automatiskt:</h3>
            <ul>
              <li>Teknisk information som IP-adress och webbläsartyp</li>
              <li>Information om hur du använder webbplatsen via cookies</li>
              <li>Besöksstatistik via analysverktyg</li>
            </ul>

            <h2>3. Varför behandlar vi dina uppgifter?</h2>
            <p>Vi behandlar dina personuppgifter för att:</p>
            <ul>
              <li>Förmedla din offertförfrågan till relevanta flyttfirmor</li>
              <li>Skicka nyhetsbrev om du prenumererar</li>
              <li>Svara på dina frågor och ge support</li>
              <li>Förbättra vår webbplats och tjänster</li>
              <li>Uppfylla rättsliga förpliktelser</li>
            </ul>

            <h2>4. Rättslig grund</h2>
            <p>
              Vi behandlar dina personuppgifter baserat på berättigat intresse för att 
              tillhandahålla våra tjänster, samt samtycke när du aktivt lämnar uppgifter 
              till oss.
            </p>

            <h2>5. Delning av uppgifter</h2>
            <p>
              När du skickar en offertförfrågan delar vi dina kontaktuppgifter och 
              flyttinformation med de flyttfirmor som kan vara relevanta för dig. 
              Vi säljer aldrig dina uppgifter till tredje part.
            </p>

            <h2>6. Lagringstid</h2>
            <p>
              Vi lagrar dina personuppgifter så länge det är nödvändigt för att uppfylla 
              de syften för vilka de samlades in, eller så länge lagen kräver.
            </p>

            <h2>7. Dina rättigheter</h2>
            <p>Enligt GDPR har du rätt att:</p>
            <ul>
              <li>Begära tillgång till dina personuppgifter</li>
              <li>Begära rättelse av felaktiga uppgifter</li>
              <li>Begära radering av dina uppgifter</li>
              <li>Invända mot behandling</li>
              <li>Begära dataportabilitet</li>
            </ul>

            <h2>8. Cookies</h2>
            <p>
              Vi använder cookies för att förbättra din upplevelse på webbplatsen. 
              Läs mer i vår <a href="/cookie-policy">cookiepolicy</a>.
            </p>

            <h2>9. Kontakt</h2>
            <p>
              Vid frågor om hur vi hanterar dina personuppgifter, kontakta oss på:
            </p>
            <p>
              <strong>FlyttGuide AB</strong><br />
              E-post: privacy@flyttguide.se<br />
              Stockholm, Sverige
            </p>

            <h2>10. Ändringar</h2>
            <p>
              Vi kan komma att uppdatera denna policy. Senaste versionen finns alltid 
              tillgänglig på denna sida.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
