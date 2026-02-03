import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { Card } from '@/components/ui/card';
import { Users, Target, Shield, Award } from 'lucide-react';
import { useSiteSettings, getPrimaryServiceName } from '@/hooks/useSiteSettings';

const breadcrumbs = [
  { label: 'Hem', href: '/' },
  { label: 'Om oss' },
];

const values = [
  {
    icon: Shield,
    title: 'Transparens',
    description: 'Vi är alltid öppna med hur vi rankar företag och vilka kommersiella samarbeten vi har.',
  },
  {
    icon: Target,
    title: 'Objektivitet',
    description: 'Våra listor baseras på objektiva kriterier som omdömen, lokal närvaro och relevans.',
  },
  {
    icon: Users,
    title: 'Konsumentfokus',
    description: 'Allt vi gör syftar till att hjälpa konsumenter göra informerade val.',
  },
  {
    icon: Award,
    title: 'Kvalitet',
    description: 'Vi granskar noggrant alla företag som listas för att säkerställa hög kvalitet.',
  },
];

export default function AboutPage() {
  const { data: settings } = useSiteSettings();
  
  const siteName = settings?.site_name || 'Katalog';
  const contactEmail = settings?.contact_email || 'info@example.com';
  const companyName = settings?.company_name || 'Företaget AB';
  const primaryCategory = settings?.primary_service_category || 'other';
  const primaryServiceTerm = getPrimaryServiceName(primaryCategory);

  return (
    <Layout>
      <SEOHead
        title={`Om ${siteName} | Vår historia & Mission`}
        description={`${siteName} hjälper svenskar hitta pålitliga ${primaryServiceTerm}. Läs om vår mission, värderingar och hur vi arbetar.`}
        canonical="/om-oss"
      />

      <section className="bg-gradient-to-b from-primary/5 to-background pt-8 pb-12 lg:pt-12 lg:pb-16">
        <div className="container">
          <Breadcrumbs items={breadcrumbs} />
          
          <div className="mt-6 max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Om {siteName}
            </h1>
            <p className="text-lg text-muted-foreground">
              Vi gör det enkelt att hitta pålitliga {primaryServiceTerm} i hela Sverige. 
              Genom att samla och strukturera information hjälper vi tusentals svenskar 
              att göra informerade val varje månad.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Vår historia</h2>
            <div className="prose prose-lg text-muted-foreground">
              <p>
                {siteName} grundades med en enkel idé: att göra det lättare för svenskar att 
                hitta rätt företag. Vi såg hur många som kämpade med att jämföra alternativ, 
                och bestämde oss för att skapa en plattform där all information samlas på ett ställe.
              </p>
              <p>
                Idag listar vi hundratals företag i Sveriges största städer. Vår data hämtas 
                från Google Business Profile och uppdateras regelbundet för att ge dig aktuell 
                och relevant information.
              </p>
              <p>
                Vi tror på transparens och öppenhet. Därför är vi alltid tydliga med vilka 
                företag som är "Rekommenderade partners" – det vill säga företag som vi har 
                ett kommersiellt samarbete med. Våra övriga listor baseras helt på objektiva 
                kriterier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-secondary/30">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-12">Våra värderingar</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value) => (
              <Card key={value.title} className="p-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent/10 mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Ansvarig utgivare</h2>
            <Card className="p-6">
              <div className="prose prose-lg text-muted-foreground">
                <p>
                  {siteName} drivs av {companyName}. 
                  Vi är registrerade hos Bolagsverket och följer svensk lag och god sed 
                  för jämförelsetjänster.
                </p>
                <p className="mb-0">
                  <strong>Kontakt:</strong><br />
                  E-post: {contactEmail}<br />
                  {settings?.company_address && <>Adress: {settings.company_address}</>}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
