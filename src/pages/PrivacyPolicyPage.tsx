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
        description="Läs om hur FlyttGuide hanterar personuppgifter i enlighet med GDPR. Vi värnar om din integritet och är transparenta med hur vi behandlar dina uppgifter."
        canonical="/integritetspolicy"
      />

      <section className="bg-gradient-to-b from-primary/5 to-background pt-8 pb-12">
        <div className="container">
          <Breadcrumbs items={breadcrumbs} />
          
          <div className="mt-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Integritetspolicy
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
            
            <h2>1. Inledning</h2>
            <p>
              J.Krasse Marketing AB, org.nr 559XXX-XXXX ("FlyttGuide", "vi", "oss", "vår"), är 
              personuppgiftsansvarig för behandlingen av dina personuppgifter på denna webbplats. 
              Vi värnar om din personliga integritet och strävar efter att alltid skydda dina 
              personuppgifter på bästa sätt.
            </p>
            <p>
              Denna integritetspolicy förklarar hur vi samlar in, använder, lagrar och skyddar 
              dina personuppgifter när du använder vår webbplats flyttguide.se och våra tjänster.
            </p>

            <h2>2. Personuppgiftsansvarig</h2>
            <p>
              <strong>J.Krasse Marketing AB</strong><br />
              Ätrastigen 5 A<br />
              311 38 Falkenberg<br />
              Sverige<br />
              E-post: privacy@flyttguide.se
            </p>

            <h2>3. Vilka personuppgifter samlar vi in?</h2>
            
            <h3>3.1 Uppgifter du lämnar aktivt till oss</h3>
            <ul>
              <li><strong>Kontaktformulär:</strong> Namn, e-postadress, telefonnummer och meddelande</li>
              <li><strong>Offertförfrågningar:</strong> Namn, kontaktuppgifter, flyttdatum, från- och tilladress, bostadstyp och övriga uppgifter om flytten</li>
              <li><strong>Nyhetsbrev:</strong> E-postadress</li>
              <li><strong>Företagsregistrering:</strong> Företagsnamn, organisationsnummer, kontaktperson och kontaktuppgifter</li>
            </ul>

            <h3>3.2 Uppgifter vi samlar in automatiskt</h3>
            <ul>
              <li><strong>Teknisk information:</strong> IP-adress, webbläsartyp, operativsystem, enhetsinformation</li>
              <li><strong>Användningsdata:</strong> Besökta sidor, tid på sidan, klick, scrollbeteende</li>
              <li><strong>Cookies och spårningstekniker:</strong> Se vår <a href="/cookies">cookiepolicy</a> för mer information</li>
              <li><strong>Referensdata:</strong> Varifrån du kom till webbplatsen (UTM-parametrar)</li>
            </ul>

            <h2>4. Varför behandlar vi dina personuppgifter?</h2>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">Ändamål</th>
                  <th className="text-left p-2 border-b">Rättslig grund</th>
                  <th className="text-left p-2 border-b">Lagringstid</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-b">Förmedla offertförfrågningar till flyttfirmor</td>
                  <td className="p-2 border-b">Avtal</td>
                  <td className="p-2 border-b">24 månader</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">Svara på kontaktförfrågningar</td>
                  <td className="p-2 border-b">Berättigat intresse</td>
                  <td className="p-2 border-b">12 månader</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">Skicka nyhetsbrev</td>
                  <td className="p-2 border-b">Samtycke</td>
                  <td className="p-2 border-b">Tills samtycke återkallas</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">Analysera och förbättra webbplatsen</td>
                  <td className="p-2 border-b">Samtycke/Berättigat intresse</td>
                  <td className="p-2 border-b">26 månader</td>
                </tr>
                <tr>
                  <td className="p-2 border-b">Uppfylla rättsliga förpliktelser</td>
                  <td className="p-2 border-b">Rättslig förpliktelse</td>
                  <td className="p-2 border-b">Enligt lag (t.ex. 7 år bokföring)</td>
                </tr>
              </tbody>
            </table>

            <h2>5. Delning av personuppgifter</h2>
            <p>Vi kan komma att dela dina personuppgifter med följande kategorier av mottagare:</p>
            <ul>
              <li><strong>Flyttfirmor:</strong> När du skickar en offertförfrågan delar vi dina kontaktuppgifter och flyttinformation med relevanta företag</li>
              <li><strong>IT-leverantörer:</strong> Hosting, e-post och andra tekniska tjänster</li>
              <li><strong>Analysverktyg:</strong> Google Analytics och liknande för att förstå hur webbplatsen används</li>
              <li><strong>Myndigheter:</strong> Om det krävs enligt lag</li>
            </ul>
            <p>
              Vi säljer aldrig dina personuppgifter till tredje part. Alla våra underleverantörer 
              är bundna av personuppgiftsbiträdesavtal och får endast behandla uppgifter enligt 
              våra instruktioner.
            </p>

            <h2>6. Överföring utanför EU/EES</h2>
            <p>
              Vissa av våra underleverantörer kan vara baserade utanför EU/EES (t.ex. USA). 
              Vid sådan överföring säkerställer vi att lämpliga skyddsåtgärder finns på plats, 
              såsom EU-kommissionens standardavtalsklausuler eller att mottagaren är certifierad 
              under EU-US Data Privacy Framework.
            </p>

            <h2>7. Dina rättigheter enligt GDPR</h2>
            <p>Du har följande rättigheter avseende dina personuppgifter:</p>
            <ul>
              <li><strong>Rätt till tillgång:</strong> Begära ett registerutdrag över vilka uppgifter vi har om dig</li>
              <li><strong>Rätt till rättelse:</strong> Begära att felaktiga uppgifter korrigeras</li>
              <li><strong>Rätt till radering:</strong> Begära att dina uppgifter raderas ("rätten att bli bortglömd")</li>
              <li><strong>Rätt till begränsning:</strong> Begära att behandlingen av dina uppgifter begränsas</li>
              <li><strong>Rätt till dataportabilitet:</strong> Få ut dina uppgifter i ett maskinläsbart format</li>
              <li><strong>Rätt att invända:</strong> Invända mot behandling baserad på berättigat intresse</li>
              <li><strong>Rätt att återkalla samtycke:</strong> Återkalla tidigare lämnat samtycke när som helst</li>
            </ul>
            <p>
              För att utöva dina rättigheter, kontakta oss på privacy@flyttguide.se. Vi svarar 
              inom 30 dagar. Du har även rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY).
            </p>

            <h2>8. Säkerhet</h2>
            <p>
              Vi vidtar lämpliga tekniska och organisatoriska säkerhetsåtgärder för att skydda 
              dina personuppgifter mot obehörig åtkomst, förlust eller förstöring. Detta inkluderar:
            </p>
            <ul>
              <li>Krypterad dataöverföring (HTTPS/TLS)</li>
              <li>Säker lagring med åtkomstkontroll</li>
              <li>Regelbundna säkerhetsuppdateringar</li>
              <li>Begränsad åtkomst till personuppgifter inom organisationen</li>
            </ul>

            <h2>9. Cookies</h2>
            <p>
              Vi använder cookies och liknande tekniker för att förbättra din upplevelse på 
              webbplatsen och för att analysera hur webbplatsen används. Läs mer i vår 
              fullständiga <a href="/cookies">cookiepolicy</a>.
            </p>

            <h2>10. Ändringar i denna policy</h2>
            <p>
              Vi kan komma att uppdatera denna integritetspolicy vid behov. Vid väsentliga 
              ändringar kommer vi att meddela dig via webbplatsen eller e-post om vi har din 
              kontaktinformation. Den senaste versionen finns alltid tillgänglig på denna sida.
            </p>

            <h2>11. Kontakt</h2>
            <p>
              Vid frågor om hur vi hanterar dina personuppgifter eller om du vill utöva dina 
              rättigheter, kontakta oss:
            </p>
            <p>
              <strong>J.Krasse Marketing AB</strong><br />
              Ätrastigen 5 A<br />
              311 38 Falkenberg<br />
              E-post: privacy@flyttguide.se
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
