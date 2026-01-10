import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { BusinessList } from '@/components/business/BusinessList';
import { CTASection } from '@/components/sections/CTASection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CityGrid } from '@/components/sections/CityGrid';
import { useCity } from '@/hooks/useCity';
import { useService } from '@/hooks/useService';
import { useBusinesses, useFeaturedBusiness } from '@/hooks/useBusinesses';
import { generateLocalBusinessSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Clock, Shield, MapPin } from 'lucide-react';

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
      <section className="bg-gradient-to-b from-primary/5 to-background pt-8 pb-12 lg:pt-12 lg:pb-16">
        <div className="container">
          <Breadcrumbs items={breadcrumbs} />

          {isLoading ? (
            <div className="space-y-4 mt-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ) : (
            <div className="mt-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Bästa {service?.name?.toLowerCase()} i {city?.name} <span className="text-accent">({currentYear})</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Jämför {businesses?.length || 0} {service?.name?.toLowerCase()} i {city?.name} baserat på omdömen, priser och kvalitet. 
                Få gratis offerter och hitta rätt företag för din flytt.
              </p>
              
              {/* Trust signals */}
              <div className="flex flex-wrap gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  <span>Uppdaterat: januari {currentYear}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent" />
                  <span>Baserat på {businesses?.reduce((sum, b) => sum + (b.review_count || 0), 0) || 0}+ omdömen</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" />
                  <span>Kvalitetsgranskade företag</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

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

      {/* SEO Content */}
      <section className="py-12 lg:py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2>Så väljer du {service?.name?.toLowerCase()} i {city?.name}</h2>
            <p>
              Att hitta rätt {service?.name?.toLowerCase()} i {city?.name} kan kännas överväldigande. 
              Med så många alternativ är det viktigt att jämföra noggrant innan du bestämmer dig. 
              Här är våra tips för att göra rätt val:
            </p>
            
            <h3>1. Jämför flera offerter</h3>
            <p>
              Be alltid om offerter från minst tre olika företag. Priserna kan variera kraftigt 
              mellan olika {service?.name?.toLowerCase()} i {city?.name}, även för samma typ av flytt.
            </p>
            
            <h3>2. Läs omdömen och recensioner</h3>
            <p>
              Företag med många positiva omdömen har ofta en bevisad track record av nöjda kunder. 
              Var uppmärksam på hur företagen hanterar eventuella klagomål.
            </p>
            
            <h3>3. Kontrollera försäkring</h3>
            <p>
              Alla seriösa {service?.name?.toLowerCase()} ska ha ansvarsförsäkring. 
              Fråga specifikt vad som täcks och hur processen ser ut om något går sönder.
            </p>
            
            <h3>4. Tänk på timing</h3>
            <p>
              Månadsskiften och sommarmånaderna är högsäsong för flyttar i {city?.name}. 
              Boka i god tid eller överväg att flytta mitt i månaden för bättre priser.
            </p>
          </div>
        </div>
      </section>

      <FAQSection faqs={faqs} />

      <CTASection cityName={city?.name} serviceName={service?.name} />

      {/* Other cities */}
      <CityGrid 
        serviceSlug={serviceSlug} 
        serviceName={service?.name || ''} 
        excludeCitySlug={citySlug}
      />
    </Layout>
  );
}
