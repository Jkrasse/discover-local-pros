import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { CTASection } from '@/components/sections/CTASection';
import { FAQSection } from '@/components/sections/FAQSection';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Star, 
  Shield, 
  ChevronRight, 
  Users, 
  CheckCircle,
  ArrowRight,
  Building2,
  Clock,
  ThumbsUp,
  Briefcase
} from 'lucide-react';
import { useCities } from '@/hooks/useCity';
import { useServices } from '@/hooks/useService';
import { useSiteSettings, getGenericServiceTerm } from '@/hooks/useSiteSettings';

export default function Index() {
  const { data: cities } = useCities();
  const { data: services } = useServices();
  const { data: settings } = useSiteSettings();

  const siteName = settings?.site_name || 'Katalog';
  const siteDescription = settings?.site_description || 'Hitta de bästa företagen';
  const heroHeadline = settings?.hero_headline || 'Hitta rätt företag';
  const heroHighlight = settings?.hero_highlight || 'för dig';
  const primaryCategory = settings?.primary_service_category || 'other';
  const genericTerm = getGenericServiceTerm(primaryCategory);

  // Get top-level services (all parent services, no sub-services)
  const topServices = services?.filter(s => !s.parent_service_id) || [];
  const popularCities = cities?.slice(0, 6) || [];
  const primaryService = topServices[0];

  const faqs = [
    {
      question: 'Hur väljer ni vilka företag som visas?',
      answer: 'Vi listar företag baserat på omdömen, lokal närvaro och relevans. Vår data hämtas från Google Business Profile och uppdateras regelbundet för att ge dig aktuell information.',
    },
    {
      question: 'Kostar det något att få offert?',
      answer: 'Nej, det är helt gratis att skicka en offertförfrågan. Du förbinder dig inte till något genom att begära offert.',
    },
    {
      question: 'Vad betyder "Rekommenderad partner"?',
      answer: 'Rekommenderad partner är ett företag som vi lyfter fram baserat på en kombination av goda omdömen och ett kommersiellt samarbete. Vi är alltid transparenta med vilka företag som är sponsrade.',
    },
    {
      question: 'Hur snabbt får jag svar på min offertförfrågan?',
      answer: 'De flesta företag återkommer inom 24 timmar. Vid högsäsong kan det ta något längre tid.',
    },
  ];

  return (
    <Layout>
      <SEOHead
        title={`${siteName} | Hitta & Jämför Tjänster | Få Gratis Offert`}
        description={`${siteDescription}. Jämför omdömen, priser och få gratis offerter. ✓ Gratis ✓ Opartisk ✓ Kvalitetsgranskade företag.`}
        canonical="/"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/5 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary/10 to-transparent animate-float opacity-60" />
          <div className="absolute bottom-10 right-1/5 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-accent/10 to-transparent animate-float-reverse opacity-50" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero badge */}
            <div className="hero-badge mb-8 animate-fade-in-up">
              <div className="hero-badge-icon">
                <Shield className="h-3.5 w-3.5 text-primary" />
              </div>
              Sveriges ledande jämförelsetjänst
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[68px] font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-in-up animate-delay-100">
              {heroHeadline}{' '}
              <span className="title-highlight">{heroHighlight}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
              Jämför lokala företag baserat på omdömen och få gratis offerter. 
              Vi hjälper dig hitta pålitliga partners i hela Sverige.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animate-delay-300">
              <a href="#quote" className="btn-hero">
                Få gratis offert
                <ArrowRight className="h-5 w-5" />
              </a>
              <Link to={primaryService ? `/${primaryService.slug}` : '/stader'}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto text-base px-8 py-6 rounded-full border-2 hover:border-primary hover:text-primary hover:bg-primary/5"
                >
                  Utforska tjänster
                </Button>
              </Link>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap justify-center gap-8 animate-fade-in-up animate-delay-400">
              {[
                { icon: Shield, text: 'Kvalitetsgranskade företag' },
                { icon: CheckCircle, text: 'Gratis & oförpliktigande' },
                { icon: Clock, text: 'Snabba offerter' },
              ].map((point, i) => (
                <div key={i} className="flex items-center gap-2.5 text-muted-foreground text-sm font-medium">
                  <div className="trust-icon">
                    <point.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span>{point.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative bg-secondary/40">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { value: '500+', label: 'Listade företag', icon: Building2 },
              { value: '50+', label: 'Städer', icon: MapPin },
              { value: '4.6', label: 'Snittbetyg', icon: Star },
              { value: '10k+', label: 'Offertförfrågningar', icon: ThumbsUp },
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon">
                  <stat.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gradient-to-b from-secondary/50 via-secondary/30 to-background relative" id="services">
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-background to-transparent pointer-events-none" />
        
        <div className="container relative z-10">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="section-tag mb-4">Våra tjänster</div>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
              Vad behöver du hjälp med?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Oavsett vad du behöver hjälp med – vi hjälper dig hitta rätt företag.
            </p>
          </div>

          {/* Service cards grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {topServices.map((service) => (
              <Link key={service.id} to={`/${service.slug}`} className="block">
                <div className="service-card h-full">
                  <div className="relative z-10">
                    <div className="service-icon">
                      <Briefcase className="h-8 w-8 text-primary transition-colors duration-500" />
                    </div>
                    <h3 className="text-xl lg:text-[22px] font-bold mb-3">
                      {service.name}
                    </h3>
                    <p className="text-muted-foreground text-[15px] leading-relaxed mb-5">
                      {service.description || 'Hitta de bästa företagen i din stad och få gratis offerter.'}
                    </p>
                    <span className="service-link">
                      Läs mer
                      <ArrowRight className="h-[18px] w-[18px]" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-24 bg-gradient-to-b from-background via-secondary/20 to-secondary/40">
        <div className="container">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="section-tag mb-4">Populära områden</div>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
              Hitta företag nära dig
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Välj din stad för att se lokala företag med bäst omdömen
            </p>
          </div>

          {/* Cities grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto mb-12">
            {popularCities.map((city) => (
              <Link 
                key={city.id} 
                to={primaryService ? `/${primaryService.slug}/${city.slug}` : `/stader`}
                className="block"
              >
                <div className="city-card">
                  <div className="city-icon">
                    <MapPin className="h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                  </div>
                  <span className="flex-1 font-semibold text-base">{city.name}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50 transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>

          {/* View all button */}
          <div className="text-center">
            <Link to="/stader">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 rounded-full border-2 hover:border-primary hover:text-primary hover:bg-primary/5"
              >
                Visa alla städer
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-gradient-to-b from-secondary/30 to-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.03] pointer-events-none" />
        
        <div className="container relative z-10">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="section-tag mb-4">Så fungerar det</div>
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
              Tre enkla steg
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Från förfrågan till färdigt jobb – så enkelt är det
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col md:flex-row justify-center gap-8 lg:gap-16 max-w-5xl mx-auto relative">
            {/* Connector line (desktop) - single line between all circles */}
            <div className="hidden md:block absolute top-10 left-1/2 -translate-x-1/2 w-[55%] h-[2px] bg-primary/30 -z-10" />
            
            {[
              {
                step: '01',
                title: 'Jämför företag',
                description: 'Sök i din stad och jämför företag baserat på omdömen och priser.',
              },
              {
                step: '02',
                title: 'Begär offert',
                description: 'Fyll i formuläret och få offerter från kvalitetsgranskade företag.',
              },
              {
                step: '03',
                title: 'Välj & boka',
                description: 'Jämför offerterna och välj det företag som passar dig bäst.',
              },
            ].map((item, i) => (
              <div key={i} className="step-card group">
                <div className="step-number">{item.step}</div>
                <h3 className="text-xl lg:text-[22px] font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div id="quote">
        <CTASection />
      </div>

      {/* FAQ Section */}
      <div className="bg-secondary/30">
        <FAQSection faqs={faqs} />
      </div>
    </Layout>
  );
}
