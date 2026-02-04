import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { HeroSectionNew } from '@/components/sections/HeroSectionNew';
import { RecommendedPartnerCard } from '@/components/business/RecommendedPartnerCard';
import { BusinessTable } from '@/components/business/BusinessTable';
import { BusinessMap } from '@/components/business/BusinessMap';
import { FAQSection } from '@/components/sections/FAQSection';
import { InfoSection } from '@/components/sections/InfoSection';
import { SubServicesSection } from '@/components/sections/SubServicesSection';
import { QuoteFormSection } from '@/components/sections/QuoteFormSection';
import { QuickContactCTA } from '@/components/sections/QuickContactCTA';
import { CityGrid } from '@/components/sections/CityGrid';
import { useCity } from '@/hooks/useCity';
import { useService } from '@/hooks/useService';
import { useBusinesses, useFeaturedBusiness } from '@/hooks/useBusinesses';
import { useServiceContent } from '@/hooks/useServiceContent';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { generateServiceTitle, generateDefaultIntroText } from '@/lib/serviceContentHelpers';
import { Skeleton } from '@/components/ui/skeleton';
import NotFound from './NotFound';
import { Award } from 'lucide-react';

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
  const { data: serviceContent } = useServiceContent(service?.id, city?.id);

  const isLoading = cityLoading || serviceLoading || businessesLoading;

  if (!citySlug || !serviceSlug) {
    return null;
  }

  if (!isLoading && (!city || !service)) {
    return <NotFound />;
  }

  const currentYear = new Date().getFullYear();
  
  // Use dynamic content or fallback to defaults
  const faqs = serviceContent?.faqs?.length 
    ? serviceContent.faqs 
    : (cityFAQs[citySlug] || defaultFAQs);
  
  // Generate dynamic title and intro
  const dynamicTitle = service && city 
    ? generateServiceTitle(service.name, city.name, currentYear)
    : '';
  
  const dynamicIntro = serviceContent?.intro_text 
    || (service && city ? generateDefaultIntroText(service.name, city.name) : '');
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
          title={dynamicTitle}
          subtitle={dynamicIntro}
          breadcrumbs={breadcrumbs}
          businessCount={businesses?.length || 0}
          reviewCount={totalReviews}
        />
      )}

      {/* Recommended Partner Section */}
      <section className="pb-12 lg:pb-16" id="businesses">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            {/* Section label */}
            <div className="section-label mb-5">
              <Award className="section-label-icon" />
              <span>Vår rekommenderade partner</span>
            </div>

            {/* Featured Business Card */}
            {isLoading ? (
              <div className="recommended-card">
                <div className="mt-14 grid md:grid-cols-[auto_1fr_auto] gap-7">
                  <Skeleton className="w-24 h-24 rounded-2xl" />
                  <div className="space-y-3">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-16 w-full max-w-xl" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-40" />
                    <Skeleton className="h-12 w-40" />
                  </div>
                </div>
              </div>
            ) : featuredBusiness ? (
              <RecommendedPartnerCard
                business={featuredBusiness}
                serviceSlug={serviceSlug}
                citySlug={citySlug}
                serviceName={service?.name?.toLowerCase() || 'flyttfirma'}
                cityName={city?.name || ''}
                cityId={city?.id}
                serviceId={service?.id}
              />
            ) : (
              <div className="recommended-card text-center py-12">
                <p className="text-muted-foreground">
                  Vi letar efter den bästa partnern för dig i {city?.name}. 
                  Fyll i formuläret nedan så hjälper vi dig hitta rätt.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <QuoteFormSection
        serviceName={service?.name || 'Flyttfirmor'}
        cityName={city?.name || ''}
        cityId={city?.id}
        serviceId={service?.id}
      />

      {/* Info Section */}
      <InfoSection 
        serviceName={service?.name || 'Flyttfirmor'} 
        cityName={city?.name || ''} 
        tips={serviceContent?.tips}
        checklist={serviceContent?.checklist}
        featureCards={serviceContent?.feature_cards}
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

      {/* All Businesses Table (including featured at top) */}
      {(businesses && businesses.length > 0) && (
        <BusinessTable
          businesses={businesses}
          featuredBusiness={featuredBusiness}
          serviceSlug={serviceSlug}
          citySlug={citySlug}
          cityName={city?.name || ''}
        />
      )}

      {/* Business Map */}
      {businesses && businesses.length > 0 && (
        <BusinessMap
          businesses={businesses}
          featuredBusinessId={featuredBusiness?.id}
          serviceName={service?.name?.toLowerCase() || 'företag'}
          cityName={city?.name || ''}
          cityLat={city?.lat}
          cityLng={city?.lng}
          serviceSlug={serviceSlug}
          citySlug={citySlug}
        />
      )}

      {/* Quick Contact CTA */}
      <QuickContactCTA
        business={featuredBusiness}
        serviceName={service?.name}
        cityName={city?.name}
      />

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
