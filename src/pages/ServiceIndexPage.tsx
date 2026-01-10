import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { CTASection } from '@/components/sections/CTASection';
import { useService } from '@/hooks/useService';
import { useCities } from '@/hooks/useCity';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, ChevronRight, Users } from 'lucide-react';

export default function ServiceIndexPage() {
  const { service: serviceSlug } = useParams();
  
  const { data: service, isLoading: serviceLoading } = useService(serviceSlug || '');
  const { data: cities, isLoading: citiesLoading } = useCities();

  const isLoading = serviceLoading || citiesLoading;

  if (!serviceSlug) {
    return null;
  }

  const breadcrumbs = [
    { label: 'Hem', href: '/' },
    { label: service?.name || serviceSlug },
  ];

  const currentYear = new Date().getFullYear();
  const title = `${service?.name || serviceSlug} i Sverige ${currentYear} | Jämför & Få Offert`;
  const description = `Hitta ${service?.name?.toLowerCase() || serviceSlug} i hela Sverige. Välj din stad och jämför lokala företag baserat på omdömen och priser.`;

  return (
    <Layout>
      <SEOHead
        title={title}
        description={description}
        canonical={`/${serviceSlug}`}
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
                {service?.name} i Sverige
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                {service?.description || `Hitta och jämför ${service?.name?.toLowerCase()} i din stad. Välj stad nedan för att se lokala företag.`}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* City grid */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">Välj din stad</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cities?.map((city) => (
                <Link key={city.id} to={`/${serviceSlug}/${city.slug}`}>
                  <Card className="p-4 h-full hover:border-accent/50 hover:shadow-card transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary group-hover:bg-accent/10 transition-colors">
                        <MapPin className="h-6 w-6 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold group-hover:text-accent transition-colors truncate">
                          {service?.name} i {city.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{city.population?.toLocaleString('sv-SE')} inv</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info section */}
      <section className="py-12 lg:py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2>Om {service?.name?.toLowerCase()}</h2>
            <p>
              Vi hjälper dig hitta de bästa {service?.name?.toLowerCase()} i hela Sverige. 
              Vårt mål är att göra det enkelt att jämföra företag och hitta det som passar 
              dina behov och budget.
            </p>
            <p>
              Alla företag vi listar har granskats och vi visar transparenta omdömen från 
              verkliga kunder. Rekommenderade partners är utvalda företag som vi har ett 
              kommersiellt samarbete med – men våra listor baseras alltid på objektiva kriterier.
            </p>
          </div>
        </div>
      </section>

      <CTASection serviceName={service?.name} />
    </Layout>
  );
}
