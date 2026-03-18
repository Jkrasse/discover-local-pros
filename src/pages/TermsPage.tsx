import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const breadcrumbs = [
  { label: 'Hem', href: '/' },
  { label: 'Användarvillkor' },
];

export default function TermsPage() {
  const { data: settings } = useSiteSettings();
  const siteName = settings?.site_name || 'Katalog';
  const contactEmail = settings?.contact_email || 'info@example.com';
  const companyName = settings?.company_name || 'Företaget AB';
  const companyAddress = settings?.company_address || 'Adress, Stad';

  return (
    <Layout>
      <SEOHead
        title={`Användarvillkor | ${siteName}`}
        description={`Läs våra användarvillkor för ${siteName}. Här förklarar vi villkoren för att använda vår tjänst.`}
        canonical="/anvandarvillkor"
      />

      <section className="bg-gradient-to-b from-primary/5 to-background pt-8 pb-12">
        <div className="container">
          <Breadcrumbs items={breadcrumbs} />
          
          <div className="mt-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Användarvillkor
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
            
            <h2>1. Inledning och godkännande</h2>
            <p>
              Dessa användarvillkor ("Villkoren") gäller för din användning av webbplatsen 
              som drivs av {companyName} ("{siteName}", "vi", "oss", "vår").
            </p>
            <p>
              Genom att använda Webbplatsen godkänner du dessa Villkor. Om du inte godkänner 
              Villkoren ber vi dig att inte använda Webbplatsen.
            </p>

            <h2>2. Tjänstebeskrivning</h2>
            <p>
              {siteName} är en informationstjänst som hjälper konsumenter att hitta och utvärdera 
              företag i Sverige. Våra tjänster inkluderar:
            </p>
            <ul>
              <li>Listning och presentation av företag baserat på omdömen och annan information</li>
              <li>Möjlighet att skicka offertförfrågningar till flera företag samtidigt</li>
              <li>Information och guider</li>
              <li>Presentation av "Rekommenderade partners" – företag vi har kommersiella samarbeten med</li>
            </ul>

            <h2>3. Kommersiella samarbeten och transparens</h2>
            <p>
              {siteName} har kommersiella samarbeten med vissa företag som listas på Webbplatsen. 
              Dessa företag kan visas som "Rekommenderade partners" och markeras tydligt.
            </p>
            <p>
              Våra övriga listor baseras på objektiva kriterier som beskrivs på vår sida 
              <a href="/hur-vi-rankar">Så rankar vi</a>. Kommersiella samarbeten påverkar inte 
              placeringen i våra organiska listor.
            </p>

            <h2>4. Ingen avtalspart</h2>
            <p>
              <strong>Viktigt:</strong> {siteName} är inte part i något avtal mellan dig och 
              företaget. Vi förmedlar endast kontakt och information. Eventuella avtal, 
              betalningar eller tvister hanteras direkt mellan dig och det valda företaget.
            </p>
            <p>
              Vi tar inget ansvar för:
            </p>
            <ul>
              <li>Kvaliteten på tjänster som utförs av listade företag</li>
              <li>Priser eller villkor som företag erbjuder</li>
              <li>Skador eller förluster som uppstår i samband med tjänsten</li>
              <li>Förseningar, avbokningar eller andra problem</li>
            </ul>

            <h2>5. Offertförfrågningar</h2>
            <p>
              När du skickar en offertförfrågan via Webbplatsen:
            </p>
            <ul>
              <li>Delas dina kontaktuppgifter och information med relevanta företag</li>
              <li>Kan du kontaktas av dessa företag via telefon, e-post eller SMS</li>
              <li>Är du inte bunden att acceptera några offerter</li>
              <li>Ansvarar du för att uppgifterna du lämnar är korrekta</li>
            </ul>

            <h2>6. Användning av webbplatsen</h2>
            <p>Du förbinder dig att:</p>
            <ul>
              <li>Endast använda Webbplatsen för lagliga ändamål</li>
              <li>Inte lämna falska eller vilseledande uppgifter</li>
              <li>Inte försöka störa eller skada Webbplatsens funktion</li>
              <li>Inte kopiera, distribuera eller modifiera innehåll utan tillstånd</li>
              <li>Inte använda automatiserade verktyg (bots, scrapers) utan skriftligt godkännande</li>
            </ul>

            <h2>7. Immateriella rättigheter</h2>
            <p>
              Allt innehåll på Webbplatsen, inklusive texter, bilder, logotyper, design och 
              programvara, tillhör {siteName} eller våra licensgivare och skyddas av upphovsrätt 
              och andra immateriella rättigheter.
            </p>
            <p>
              Du får inte använda vårt innehåll utan skriftligt godkännande, förutom för privat, 
              icke-kommersiellt bruk.
            </p>

            <h2>8. Omdömen och information</h2>
            <p>
              Omdömen och betyg som visas på Webbplatsen hämtas från externa källor som 
              Google Business Profile. Vi garanterar inte att informationen är korrekt, 
              komplett eller uppdaterad.
            </p>
            <p>
              Företagsinformation uppdateras regelbundet men kan innehålla fel. Verifiera 
              alltid viktiga uppgifter direkt med företaget.
            </p>

            <h2>9. Ansvarsbegränsning</h2>
            <p>
              Webbplatsen tillhandahålls "i befintligt skick". Vi garanterar inte att Webbplatsen:
            </p>
            <ul>
              <li>Är tillgänglig utan avbrott</li>
              <li>Är fri från fel eller virus</li>
              <li>Uppfyller dina förväntningar</li>
            </ul>
            <p>
              I den utsträckning lagen tillåter ansvarar vi inte för indirekta skador, 
              utebliven vinst eller följdskador som uppstår genom användning av Webbplatsen.
            </p>

            <h2>10. Länkar till tredje part</h2>
            <p>
              Webbplatsen kan innehålla länkar till externa webbplatser. Vi kontrollerar inte 
              dessa webbplatser och ansvarar inte för deras innehåll, integritetspolicyer 
              eller praxis.
            </p>

            <h2>11. Ändringar av villkoren</h2>
            <p>
              Vi förbehåller oss rätten att ändra dessa Villkor när som helst. Ändringar träder 
              i kraft när de publiceras på Webbplatsen. Din fortsatta användning av Webbplatsen 
              efter ändringar innebär att du godkänner de uppdaterade Villkoren.
            </p>

            <h2>12. Tillämplig lag och tvister</h2>
            <p>
              Dessa Villkor regleras av svensk lag. Tvister som uppstår i anledning av dessa 
              Villkor ska i första hand lösas genom dialog. Om parterna inte kan enas ska 
              tvisten avgöras av svensk allmän domstol.
            </p>

            <h2>13. Kontakt</h2>
            <p>
              Vid frågor om dessa användarvillkor, kontakta oss:
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
