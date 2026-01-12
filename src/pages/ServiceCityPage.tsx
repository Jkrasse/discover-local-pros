import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { HeroSectionNew } from '@/components/sections/HeroSectionNew';
import { BusinessCard } from '@/components/business/BusinessCard';
import { BusinessTable } from '@/components/business/BusinessTable';
import { FAQSection } from '@/components/sections/FAQSection';
import { InfoSection } from '@/components/sections/InfoSection';
import { SubServicesSection } from '@/components/sections/SubServicesSection';
import { CityGrid } from '@/components/sections/CityGrid';
import { Card } from '@/components/ui/card';
import { LeadForm } from '@/components/forms/LeadForm';
import { useCity } from '@/hooks/useCity';
import { useService } from '@/hooks/useService';
import { useBusinesses, useFeaturedBusiness } from '@/hooks/useBusinesses';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { Skeleton } from '@/components/ui/skeleton';
import NotFound from './NotFound';

const cityFAQs: Record<string, { question: string; answer: string }[]> = {
  stockholm: [
    {
      question: 'Vad kostar det att anlita en flyttfirma i Stockholm?',
      answer: 'Priset varierar beroende på bostadens storlek och flyttsträcka. En lägenhetsflytt i Stockholm kostar vanligtvis mellan 3 000 och 15 000 kr. Be alltid om offert för att få ett exakt pris.',
    },
    {
      question: 'Hur långt i förväg bör jag boka flyttfirma i Stockholm?',
      answer: 'Vi rekommenderar att boka minst 2-4 veckor i förväg, särskilt under högsäsong (april-september). Vid månadsskiften kan det vara ännu svårare att få tider.',
    },
    {
      question: 'Behöver jag parkeringstillstånd för flyttbilen i Stockholm?',
      answer: 'Ja, för att parkera på gatan i Stockholm city behöver flyttfirman ofta parkeringstillstånd. Professionella flyttfirmor hjälper till att ordna detta.',
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
      answer: 'En genomsnittlig lägenhetsflytt i Göteborg kostar mellan 2 500 och 12 000 kr beroende på storlek och avstånd.',
    },
    {
      question: 'Vilka stadsdelar är svårast att flytta i Göteborg?',
      answer: 'Vasastan, Linnéstaden och Haga kan vara utmanande på grund av smala gator och begränsade parkeringsmöjligheter. Planera extra tid för dessa områden.',
    },
    {
      question: 'Hur bokar jag flyttfirma i Göteborg?',
      answer: 'Fyll i vårt formulär med information om din flytt så kontaktar vår rekommenderade partner dig med en offert.',
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
      answer: 'Börja med att begära offert via vårt formulär. Vi hjälper dig hitta en pålitlig partner för långdistansflytt.',
    },
  ],
};

const defaultFAQs = [
  {
    question: 'Hur väljer jag rätt flyttfirma?',
    answer: 'Läs omdömen, kontrollera att de har försäkring och be om en detaljerad offert. Vår rekommenderade partner har genomgått kvalitetskontroll.',
  },
  {
    question: 'Vad ingår vanligtvis i en fullservice-flytt?',
    answer: 'En fullservice-flytt inkluderar oftast packning av alla tillhörigheter, transport, uppackning på nya adressen samt bortforsling av emballage.',
  },
  {
    question: 'Hur fungerar offertförfrågningar via FlyttGuide?',
    answer: 'Fyll i vårt formulär med information om din flytt. Vår rekommenderade partner kontaktar dig med en offert, vanligtvis inom 24 timmar.',
  },
];

export default function ServiceCityPage() {
  const { serviceSlug, citySlug } = useParams();
  
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

  if (!isLoading && (!city || !service)) {
    return <NotFound />;
  }

  const faqs = cityFAQs[citySlug] || defaultFAQs;
  const currentYear = new Date().getFullYear();
  const totalReviews = businesses?.reduce((sum, b) => sum + (b.review_count || 0), 0) || 0;

  // Get other businesses (not featured)
  const otherBusinesses = featuredBusiness
    ? (businesses || []).filter((b) => b.id !== featuredBusiness.id)
    : (businesses || []);

  const breadcrumbs = [
    { label: 'Hem', href: '/' },
    { label: service?.name || serviceSlug, href: `/${serviceSlug}` },
    { label: city?.name || citySlug },
  ];

  const title = city?.seo_title || `Bästa ${service?.name?.toLowerCase()} i ${city?.name} ${currentYear}`;
  const description = city?.seo_description || `Hitta pålitliga ${service?.name?.toLowerCase() || 'flyttfirmor'} i ${city?.name || citySlug}. Få gratis offert från vår rekommenderade partner.`;

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
          subtitle={`Hitta en pålitlig ${service?.name?.toLowerCase()?.replace(/or$/, 'a')} i ${city?.name}. Vår rekommenderade partner har granskats för kvalitet och pålitlighet.`}
          breadcrumbs={breadcrumbs}
          businessCount={businesses?.length || 0}
          reviewCount={totalReviews}
        />
      )}

      {/* Featured Business */}
      {featuredBusiness && (
        <section className="py-8 lg:py-12" id="businesses">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-semibold mb-4">Vår rekommenderade partner</h2>
              <BusinessCard
                business={featuredBusiness}
                serviceSlug={serviceSlug}
                citySlug={citySlug}
                isFeatured
              />
            </div>
          </div>
        </section>
      )}

      {/* Lead Form Section */}
      <section id="lead-form" className="py-12 lg:py-16 bg-secondary/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-5xl mx-auto">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Få offert från {service?.name?.toLowerCase()} i {city?.name}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Fyll i formuläret så kontaktar vår rekommenderade partner dig med en offert. 
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
                    <h3 className="font-medium">Få offert</h3>
                    <p className="text-sm text-muted-foreground">
                      Vår rekommenderade partner kontaktar dig inom 24 timmar
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Boka din flytt</h3>
                    <p className="text-sm text-muted-foreground">
                      Acceptera offerten och boka ett datum som passar dig
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

      {/* Sub-services Section */}
      {service?.id && city && (
        <SubServicesSection
          parentServiceId={service.id}
          parentServiceName={service.name}
          citySlug={citySlug}
          cityName={city.name}
        />
      )}

      {/* Other Businesses Table */}
      {otherBusinesses.length > 0 && (
        <BusinessTable
          businesses={otherBusinesses}
          serviceSlug={serviceSlug}
          citySlug={citySlug}
          cityName={city?.name || ''}
        />
      )}

      {/* FAQ Section */}
      <FAQSection 
        title={`Vanliga frågor om ${service?.name?.toLowerCase()} i ${city?.name}`}
        faqs={faqs} 
      />

      {/* Other cities */}
      <CityGrid 
        serviceSlug={serviceSlug} 
        serviceName={service?.name || ''} 
        excludeCitySlug={citySlug}
      />
    </Layout>
  );
}
