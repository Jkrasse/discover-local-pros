import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { HeroSection } from '@/components/sections/HeroSection';
import { CTASection } from '@/components/sections/CTASection';
import { FAQSection } from '@/components/sections/FAQSection';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Star, Shield, ChevronRight, Users, Clock } from 'lucide-react';

const popularCities = [
  { name: 'Stockholm', slug: 'stockholm', region: 'Stockholms län' },
  { name: 'Göteborg', slug: 'goteborg', region: 'Västra Götaland' },
  { name: 'Malmö', slug: 'malmo', region: 'Skåne' },
  { name: 'Uppsala', slug: 'uppsala', region: 'Uppsala län' },
  { name: 'Västerås', slug: 'vasteras', region: 'Västmanland' },
  { name: 'Örebro', slug: 'orebro', region: 'Örebro län' },
];

const services = [
  {
    name: 'Flyttfirmor',
    slug: 'flyttfirmor',
    description: 'Fullservice-flytt med packning och transport',
    icon: Truck,
  },
  {
    name: 'Flyttbil',
    slug: 'flyttbil',
    description: 'Hyr flyttbil med eller utan förare',
    icon: Truck,
  },
  {
    name: 'Flytthjälp',
    slug: 'flytthjalp',
    description: 'Extra händer för tunga lyft',
    icon: Users,
  },
  {
    name: 'Magasinering',
    slug: 'magasinering',
    description: 'Säker förvaring för dina saker',
    icon: Shield,
  },
];

const faqs = [
  {
    question: 'Hur väljer ni vilka flyttfirmor som visas?',
    answer: 'Vi listar flyttfirmor baserat på omdömen, lokal närvaro och relevans. Vår data hämtas från Google Business Profile och uppdateras regelbundet för att ge dig aktuell information.',
  },
  {
    question: 'Kostar det något att få offert?',
    answer: 'Nej, det är helt gratis att skicka en offertförfrågan via FlyttGuide. Du förbinder dig inte till något genom att begära offert.',
  },
  {
    question: 'Vad betyder "Rekommenderad partner"?',
    answer: 'Rekommenderad partner är ett företag som vi lyfter fram baserat på en kombination av goda omdömen och ett kommersiellt samarbete. Vi är alltid transparenta med vilka företag som är sponsrade.',
  },
  {
    question: 'Hur snabbt får jag svar på min offertförfrågan?',
    answer: 'De flesta företag återkommer inom 24 timmar. Vid högsäsong (sommaren) kan det ta något längre tid.',
  },
];

export default function Index() {
  return (
    <Layout>
      <SEOHead
        title="Hitta Flyttfirma | Jämför & Få Offert Gratis | FlyttGuide"
        description="Hitta pålitliga flyttfirmor i hela Sverige. Jämför omdömen, priser och få gratis offerter. ✓ Gratis ✓ Opartisk ✓ Kvalitetsgranskade företag."
        canonical="/"
      />

      <HeroSection
        title="Hitta rätt flyttfirma för din flytt"
        subtitle="Jämför lokala flyttfirmor baserat på omdömen och få gratis offerter. Vi hjälper dig hitta pålitliga företag i hela Sverige."
      />

      {/* Stats */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-accent mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Listade företag</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Städer</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">4.6</div>
              <div className="text-sm text-muted-foreground">Snittbetyg</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">10k+</div>
              <div className="text-sm text-muted-foreground">Offertförfrågningar</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Våra tjänster
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Oavsett om du behöver fullservice-flytt eller bara en flyttbil – vi hjälper dig hitta rätt.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <Link key={service.slug} to={`/${service.slug}`}>
                <Card className="p-6 h-full hover:border-accent/50 hover:shadow-card transition-all group">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 mb-4 group-hover:bg-accent/20 transition-colors">
                    <service.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular cities */}
      <section className="py-12 lg:py-16 bg-secondary/30">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Populära städer
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Hitta flyttfirmor i Sveriges största städer
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {popularCities.map((city) => (
              <Link key={city.slug} to={`/flyttfirmor/${city.slug}`}>
                <Card className="p-4 hover:border-accent/50 hover:shadow-card transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary group-hover:bg-accent/10 transition-colors">
                      <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-medium group-hover:text-accent transition-colors">
                        {city.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{city.region}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 ml-auto" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/stader">
              <Button variant="outline">Visa alla städer</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Så fungerar det
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Tre enkla steg till en smidig flytt
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">1</span>
              </div>
              <h3 className="font-semibold mb-2">Jämför företag</h3>
              <p className="text-sm text-muted-foreground">
                Sök i din stad och jämför flyttfirmor baserat på omdömen och priser.
              </p>
            </div>

            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">2</span>
              </div>
              <h3 className="font-semibold mb-2">Begär offert</h3>
              <p className="text-sm text-muted-foreground">
                Fyll i formuläret och få offerter från kvalitetsgranskade företag.
              </p>
            </div>

            <div className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mx-auto mb-4">
                <span className="text-2xl font-bold text-accent">3</span>
              </div>
              <h3 className="font-semibold mb-2">Välj & boka</h3>
              <p className="text-sm text-muted-foreground">
                Jämför offerterna och välj den flyttfirma som passar dig bäst.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection />

      <FAQSection faqs={faqs} />
    </Layout>
  );
}
