import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { Card } from '@/components/ui/card';
import { Star, MapPin, Clock, MessageCircle, BadgeCheck, TrendingUp } from 'lucide-react';

const breadcrumbs = [
  { label: 'Hem', href: '/' },
  { label: 'Hur vi rankar' },
];

const factors = [
  {
    icon: Star,
    title: 'Kundbetyg',
    weight: '40%',
    description: 'Vi väger in snittbetyg från Google-recensioner. Företag med högre betyg rankas högre.',
  },
  {
    icon: MessageCircle,
    title: 'Antal omdömen',
    weight: '25%',
    description: 'Fler omdömen indikerar mer erfarenhet och ger en mer tillförlitlig bild av företaget.',
  },
  {
    icon: MapPin,
    title: 'Lokal närvaro',
    weight: '20%',
    description: 'Företag med fysisk närvaro i staden och som verifierat sin adress rankas högre.',
  },
  {
    icon: Clock,
    title: 'Aktualitet',
    weight: '10%',
    description: 'Nyligen uppdaterad information och färska omdömen väger positivt.',
  },
  {
    icon: BadgeCheck,
    title: 'Verifiering',
    weight: '5%',
    description: 'Verifierade företag med komplett profil får en liten bonus i rankningen.',
  },
];

export default function HowWeRankPage() {
  return (
    <Layout>
      <SEOHead
        title="Hur vi rankar | FlyttGuide Metodik & Transparens"
        description="Läs om hur FlyttGuide rankar och listar flyttfirmor. Vi förklarar vår metodik, datakällor och hur 'Rekommenderad partner' fungerar."
        canonical="/hur-vi-rankar"
      />

      <section className="bg-gradient-to-b from-primary/5 to-background pt-8 pb-12 lg:pt-12 lg:pb-16">
        <div className="container">
          <Breadcrumbs items={breadcrumbs} />
          
          <div className="mt-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Hur vi rankar företag
            </h1>
            <p className="text-lg text-muted-foreground">
              Transparens är kärnan i allt vi gör. Här förklarar vi exakt hur vi väljer ut 
              och rankar de företag som visas på FlyttGuide.
            </p>
          </div>
        </div>
      </section>

      {/* Data sources */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Våra datakällor</h2>
            <div className="prose prose-lg text-muted-foreground mb-8">
              <p>
                All företagsdata på FlyttGuide hämtas primärt från <strong>Google Business Profile</strong> 
                (tidigare Google My Business). Detta inkluderar:
              </p>
              <ul>
                <li>Företagsnamn och kontaktuppgifter</li>
                <li>Adress och geografisk placering</li>
                <li>Betyg och antal recensioner</li>
                <li>Öppettider och kategorier</li>
                <li>Bilder och eventuell webbplats</li>
              </ul>
              <p>
                Vi uppdaterar vår data regelbundet för att säkerställa att informationen är aktuell. 
                Företag kan också kontakta oss för att uppdatera eller korrigera sin information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ranking factors */}
      <section className="py-12 lg:py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Rankningsfaktorer</h2>
            <p className="text-muted-foreground mb-8">
              Företag rankas baserat på en kombination av följande faktorer:
            </p>
            
            <div className="space-y-4">
              {factors.map((factor) => (
                <Card key={factor.title} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <factor.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{factor.title}</h3>
                        <span className="text-sm font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
                          {factor.weight}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{factor.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured partner */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Om "Rekommenderad partner"</h2>
            <Card className="p-6 border-accent/30 bg-accent/5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/20">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div className="prose prose-lg text-muted-foreground">
                  <p className="mt-0">
                    <strong className="text-foreground">"Rekommenderad partner"</strong> är ett företag som vi 
                    lyfter fram på särskilt framträdande placering. Detta är ett <strong>kommersiellt samarbete</strong> 
                    där företaget betalar för att synas.
                  </p>
                  <p>
                    För att kvalificera sig som Rekommenderad partner måste företaget uppfylla våra kvalitetskrav:
                  </p>
                  <ul>
                    <li>Minst 4.0 i snittbetyg på Google</li>
                    <li>Minst 20 omdömen</li>
                    <li>Verifierad företagsprofil</li>
                    <li>Giltig ansvarsförsäkring</li>
                  </ul>
                  <p className="mb-0">
                    Vi är alltid transparenta med vilka företag som är sponsrade. 
                    Övriga företag på listorna rankas helt baserat på objektiva kriterier.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 lg:py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Frågor om vår metodik?</h2>
            <p className="text-muted-foreground mb-6">
              Vi välkomnar feedback och frågor om hur vi arbetar. Kontakta oss gärna!
            </p>
            <a 
              href="mailto:hej@flyttguide.se" 
              className="inline-flex items-center gap-2 text-accent hover:underline"
            >
              hej@flyttguide.se
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
