import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { HeroSectionNew } from '@/components/sections/HeroSectionNew';
import { BusinessList } from '@/components/business/BusinessList';
import { CTASection } from '@/components/sections/CTASection';
import { FAQSection } from '@/components/sections/FAQSection';
import { InfoSection } from '@/components/sections/InfoSection';
import { CityGrid } from '@/components/sections/CityGrid';
import { Card } from '@/components/ui/card';
import { LeadForm } from '@/components/forms/LeadForm';
import { useCity } from '@/hooks/useCity';
import { useService } from '@/hooks/useService';
import { useBusinesses, useFeaturedBusiness } from '@/hooks/useBusinesses';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';

const cityFAQs: Record<string, { question: string; answer: string }[]> = {
  stockholm: [
    {
      question: 'Vad kostar det att anlita en flyttfirma i Stockholm?',
      answer: 'Priset varierar beroende på bostadens storlek och flyttsträcka. En lägenhetsflytt i Stockholm kostar vanligtvis mellan 3 000 och 15 000 kr. Be alltid om offert från flera företag.',
    },
    {
      question: 'Hur långt i förväg bör jag boka flyttfirma i Stockholm?',
      answer: 'Vi rekommenderar att boka minst 2-4 veckor i förväg, särskilt under högsäsong (april-september). Vid månadsskiften kan det vara ännu svårare att få tider.',
    },
    {
      question: 'Behöver jag parkeringstillstånd för flyttbilen i Stockholm?',
      answer: 'Ja, för att parkera på gatan i Stockholm city behöver flyttfirman ofta parkeringstillstånd. Många professionella flyttfirmor hjälper till att ordna detta.',
    },
    {
      question: 'Ingår flyttstädning hos flyttfirmor i Stockholm?',
      answer: 'Det varierar mellan företag. Vissa erbjuder paketlösningar med flyttstädning, medan andra samarbetar med städfirmor. Fråga alltid när du begär offert.',
    },
    {
      question: 'Är mina saker försäkrade under flytten?',
      answer: 'Seriösa flyttfirmor har ansvarsförsäkring. Kontrollera alltid att företaget har giltig försäkring och fråga vad som täcks innan du bokar.',
    },
  ],
  goteborg: [
    {
      question: 'Vad kostar en flytt i Göteborg?',
      answer: 'En genomsnittlig lägenhetsflytt i Göteborg kostar mellan 2 500 och 12 000 kr beroende på storlek och avstånd. Jämför alltid flera offerter.',
    },
    {
      question: 'Vilka stadsdelar är svårast att flytta i Göteborg?',
      answer: 'Vasastan, Linnéstaden och Haga kan vara utmanande på grund av smala gator och begränsade parkeringsmöjligheter. Planera extra tid för dessa områden.',
    },
    {
      question: 'Hur bokar jag flyttfirma i Göteborg?',
      answer: 'Jämför företag här på FlyttGuide, begär gratis offerter och välj den som passar dina behov och budget bäst.',
    },
    {
      question: 'Kan flyttfirman hjälpa till med packning?',
      answer: 'Ja, de flesta flyttfirmor i Göteborg erbjuder packhjälp som tilläggstjänst. Det kan vara värt extrakostnaden om du har ont om tid.',
    },
  ],
  malmo: [
    {
      question: 'Vad kostar en flyttfirma i Malmö?',
      answer: 'Priser i Malmö ligger ofta något lägre än i Stockholm och Göteborg. Räkna med 2 000-10 000 kr för en lägenhetsflytt.',
    },
    {
      question: 'Kan jag flytta till Danmark med en svensk flyttfirma?',
      answer: 'Ja, flera flyttfirmor i Malmö erbjuder flyttar till Köpenhamn och andra danska städer. Kontrollera att de har rätt tillstånd för internationella flyttar.',
    },
    {
      question: 'Hur planerar jag en flytt till Malmö från annan stad?',
      answer: 'Börja med att jämföra offerter från flyttfirmor som erbjuder långdistansflytt. Boka i god tid och planera för eventuell mellanlagring.',
    },
  ],
};

const defaultFAQs = [
  {
    question: 'Hur väljer jag rätt flyttfirma?',
    answer: 'Jämför omdömen, begär offerter från flera företag och kontrollera att de har försäkring. Läs recensioner och fråga om referensprojekt.',
  },
  {
    question: 'Vad ingår vanligtvis i en fullservice-flytt?',
    answer: 'En fullservice-flytt inkluderar oftast packning av alla tillhörigheter, transport, uppackning på nya adressen samt bortforsling av emballage.',
  },
  {
    question: 'Hur fungerar offertförfrågningar via FlyttGuide?',
    answer: 'Fyll i vårt formulär med information om din flytt. Relevanta flyttfirmor i ditt område kontaktar dig med offerter, vanligtvis inom 24 timmar.',
  },
];

export default function ServiceCityPage() {
  const { service: serviceSlug, city: citySlug } = useParams();
  
  const { data: city, isLoading: cityLoading } = useCity(citySlug || '');
  const { data: service, isLoading: serviceLoading } = useService(serviceSlug || '');
  const { data: businesses, isLoading: businessesLoading } = useBusinesses({
    citySlug: citySlug || '',
    serviceSlug: serviceSlug || '',
  });
  const { data: featuredBusiness } = useFeaturedBusiness(citySlug || '', serviceSlug || '');

  const isLoading = cityLoading || serviceLoading || businessesLoading;

  if (!citySlug || !serviceSlug) {
    return null;
  }

  const faqs = cityFAQs[citySlug] || defaultFAQs;
  const currentYear = new Date().getFullYear();
  const totalReviews = businesses?.reduce((sum, b) => sum + (b.review_count || 0), 0) || 0;

  const breadcrumbs = [
    { label: 'Hem', href: '/' },
    { label: service?.name || serviceSlug, href: `/${serviceSlug}` },
    { label: city?.name || citySlug },
  ];

  const title = city?.seo_title || `Bästa ${service?.name || 'Flyttfirmor'} i ${city?.name || citySlug} ${currentYear}`;
  const description = city?.seo_description || `Hitta pålitliga ${service?.name?.toLowerCase() || 'flyttfirmor'} i ${city?.name || citySlug}. Jämför priser, läs omdömen och få gratis offerter.`;

  const jsonLd = [];
  
  // Add breadcrumb schema
  jsonLd.push(generateBreadcrumbSchema(breadcrumbs));
  
  // Add FAQ schema
  jsonLd.push(generateFAQSchema(faqs));
  
  // Add LocalBusiness schema for featured business
  if (featuredBusiness) {
    jsonLd.push(generateLocalBusinessSchema({
      name: featuredBusiness.name,
      description: featuredBusiness.description || '',
      address: featuredBusiness.address || '',
      phone: featuredBusiness.phone || '',
      website: featuredBusiness.website || '',
      rating: featuredBusiness.rating || undefined,
      reviewCount: featuredBusiness.review_count || undefined,
      image: featuredBusiness.images?.[0],
    }));
  }

  return (
    <Layout>
      <SEOHead
        title={title}
        description={description}
        canonical={`/${serviceSlug}/${citySlug}`}
        jsonLd={jsonLd}
      />

      {/* Hero */}
      {isLoading ? (
        <section className="bg-gradient-to-b from-primary/5 to-background pt-8 pb-12">
          <div className="container">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
        </section>
      ) : (
        <HeroSectionNew
          title={`Bästa ${service?.name?.toLowerCase()} i ${city?.name} (${currentYear})`}
          subtitle={`Jämför ${businesses?.length || 0} ${service?.name?.toLowerCase()} i ${city?.name} baserat på omdömen, priser och kvalitet. Få gratis offerter och hitta rätt företag för din flytt.`}
          breadcrumbs={breadcrumbs}
          businessCount={businesses?.length || 0}
          reviewCount={totalReviews}
        />
      )}

      {/* Business listings */}
      <section className="py-8 lg:py-12">
        <div className="container">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : (
            <BusinessList
              businesses={businesses || []}
              featuredBusiness={featuredBusiness || undefined}
              serviceSlug={serviceSlug}
              citySlug={citySlug}
            />
          )}
        </div>
      </section>

      {/* Lead Form Section */}
      <section id="lead-form" className="py-12 lg:py-16 bg-secondary/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Få offert från {service?.name?.toLowerCase()} i {city?.name}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Fyll i formuläret så kontaktar vi dig med offerter från pålitliga företag i ditt område. 
                Det är helt gratis och utan förpliktelse.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Beskriv din flytt</h3>
                    <p className="text-sm text-muted-foreground">
                      Berätta var du ska flytta och vilken typ av bostad det gäller
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Få offerter</h3>
                    <p className="text-sm text-muted-foreground">
                      Vi kontaktar lokala företag som matchar dina behov
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Jämför & välj</h3>
                    <p className="text-sm text-muted-foreground">
                      Jämför priser och välj det företag som passar dig bäst
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-6 lg:p-8 shadow-card">
              <h3 className="text-xl font-semibold mb-6">Fyll i dina uppgifter</h3>
              <LeadForm cityId={city?.id} serviceId={service?.id} />
            </Card>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <InfoSection 
        serviceName={service?.name || 'Flyttfirmor'} 
        cityName={city?.name || ''} 
      />

      {/* FAQ Section */}
      <FAQSection 
        title={`Vanliga frågor om ${service?.name?.toLowerCase()} i ${city?.name}`}
        faqs={faqs} 
      />

      {/* Trust Section */}
      <section className="py-12 lg:py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
              <Info className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-xl font-semibold mb-3">Om våra rekommendationer</h2>
            <p className="text-muted-foreground mb-4">
              Vi granskar och jämför {service?.name?.toLowerCase()} baserat på omdömen, priser, tillgänglighet och 
              kundservice. Rekommenderade företag har genomgått extra kvalitetskontroll och 
              uppfyller våra krav på professionalism.
            </p>
            <Link 
              to="/hur-vi-rankar" 
              className="text-accent hover:underline font-medium"
            >
              Läs mer om hur vi rankar företag →
            </Link>
          </div>
        </div>
      </section>

      {/* Other cities */}
      <CityGrid 
        serviceSlug={serviceSlug} 
        serviceName={service?.name || ''} 
        excludeCitySlug={citySlug}
      />
    </Layout>
  );
}
