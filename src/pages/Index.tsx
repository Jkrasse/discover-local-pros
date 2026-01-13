import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { CTASection } from '@/components/sections/CTASection';
import { FAQSection } from '@/components/sections/FAQSection';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Truck, 
  MapPin, 
  Star, 
  Shield, 
  ChevronRight, 
  Users, 
  CheckCircle,
  ArrowRight,
  Building2,
  Clock,
  Award,
  ThumbsUp
} from 'lucide-react';
import { useCities } from '@/hooks/useCity';
import { useServices } from '@/hooks/useService';

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

const trustPoints = [
  { icon: Shield, text: 'Kvalitetsgranskade företag' },
  { icon: CheckCircle, text: 'Gratis & oförpliktigande' },
  { icon: Clock, text: 'Snabba offerter' },
];

export default function Index() {
  const { data: cities } = useCities();
  const { data: services } = useServices();

  // Get top-level services and limit cities
  const topServices = services?.filter(s => !s.parent_service_id)?.slice(0, 4) || [];
  const popularCities = cities?.slice(0, 6) || [];
  const primaryService = topServices[0];

  const serviceIcons: Record<string, typeof Truck> = {
    'flyttfirmor': Truck,
    'flyttbil': Truck,
    'flytthjalp': Users,
    'magasinering': Building2,
  };

  return (
    <Layout>
      <SEOHead
        title="Hitta & Jämför Tjänster | Få Gratis Offert"
        description="Hitta pålitliga företag i hela Sverige. Jämför omdömen, priser och få gratis offerter. ✓ Gratis ✓ Opartisk ✓ Kvalitetsgranskade företag."
        canonical="/"
      />

      {/* Hero Section - Clean WordPress style */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.03] via-background to-background">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.08),transparent_50%)]" />
        
        <div className="container relative">
          <div className="py-16 lg:py-24 max-w-4xl mx-auto text-center">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <Award className="h-4 w-4" />
              <span>Sveriges ledande jämförelsetjänst</span>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Hitta rätt företag för{' '}
              <span className="text-accent">din flytt</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Jämför lokala företag baserat på omdömen och få gratis offerter. 
              Vi hjälper dig hitta pålitliga partners i hela Sverige.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="btn-hero text-base px-8 py-6">
                Få gratis offert
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Link to={primaryService ? `/${primaryService.slug}` : '/stader'}>
                <Button variant="outline" size="lg" className="text-base px-8 py-6 w-full sm:w-auto">
                  Utforska tjänster
                </Button>
              </Link>
            </div>

            {/* Trust points */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              {trustPoints.map((point, i) => (
                <div key={i} className="flex items-center gap-2">
                  <point.icon className="h-4 w-4 text-success" />
                  <span>{point.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Clean cards */}
      <section className="py-12 lg:py-16 border-y border-border bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { value: '500+', label: 'Listade företag', icon: Building2 },
              { value: '50+', label: 'Städer', icon: MapPin },
              { value: '4.6', label: 'Snittbetyg', icon: Star },
              { value: '10k+', label: 'Offertförfrågningar', icon: ThumbsUp },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent/10 mb-3">
                  <stat.icon className="h-6 w-6 text-accent" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - WordPress theme style */}
      <section className="py-16 lg:py-24">
        <div className="container">
          {/* Section header */}
          <div className="text-center mb-12">
            <span className="inline-block text-accent text-sm font-semibold tracking-wider uppercase mb-3">
              Våra tjänster
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Vad behöver du hjälp med?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Oavsett om du behöver fullservice-flytt eller bara en flyttbil – vi hjälper dig hitta rätt.
            </p>
          </div>

          {/* Service cards grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topServices.map((service) => {
              const IconComponent = serviceIcons[service.slug] || Truck;
              return (
                <Link key={service.id} to={`/${service.slug}`}>
                  <Card className="group h-full p-6 border border-border hover:border-accent/40 hover:shadow-lg transition-all duration-300 bg-card">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 mb-5 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                      <IconComponent className="h-7 w-7 text-accent group-hover:text-accent-foreground transition-colors" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-accent transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description || 'Hitta de bästa företagen i din stad'}
                    </p>
                    <div className="flex items-center text-accent text-sm font-medium">
                      <span>Hitta företag</span>
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container">
          {/* Section header */}
          <div className="text-center mb-12">
            <span className="inline-block text-accent text-sm font-semibold tracking-wider uppercase mb-3">
              Populära områden
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hitta företag nära dig
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Välj din stad för att se lokala företag med bäst omdömen
            </p>
          </div>

          {/* Cities grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {popularCities.map((city) => (
              <Link 
                key={city.id} 
                to={primaryService ? `/${primaryService.slug}/${city.slug}` : `/stader`}
              >
                <Card className="group p-5 border border-border hover:border-accent/40 hover:shadow-md transition-all duration-300 bg-card">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary group-hover:bg-accent/10 transition-colors">
                      <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                        {city.name}
                      </h3>
                      {city.region && (
                        <p className="text-sm text-muted-foreground truncate">{city.region}</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* View all button */}
          <div className="text-center mt-10">
            <Link to="/stader">
              <Button variant="outline" size="lg" className="px-8">
                Visa alla städer
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-block text-accent text-sm font-semibold tracking-wider uppercase mb-3">
              Så fungerar det
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tre enkla steg
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Från förfrågan till färdigt jobb – så enkelt är det
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Jämför företag',
                description: 'Sök i din stad och jämför företag baserat på omdömen och priser.',
                icon: Building2,
              },
              {
                step: '02',
                title: 'Begär offert',
                description: 'Fyll i formuläret och få offerter från kvalitetsgranskade företag.',
                icon: CheckCircle,
              },
              {
                step: '03',
                title: 'Välj & boka',
                description: 'Jämför offerterna och välj det företag som passar dig bäst.',
                icon: ThumbsUp,
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                {/* Connector line (desktop only) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-border" />
                )}
                
                {/* Step number circle */}
                <div className="relative inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-accent/10 mb-6 group-hover:bg-accent/20 transition-colors">
                  <span className="text-2xl font-bold text-accent">{item.step}</span>
                </div>

                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />

      {/* FAQ Section */}
      <FAQSection faqs={faqs} />
    </Layout>
  );
}
