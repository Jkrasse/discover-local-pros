import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { CTASection } from '@/components/sections/CTASection';
import { useService, useServices } from '@/hooks/useService';
import { useCities } from '@/hooks/useCity';
import { useServiceContent } from '@/hooks/useServiceContent';
import { generateDefaultIntroText } from '@/lib/serviceContentHelpers';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, ChevronRight, Users, Search, ArrowRight, CheckCircle } from 'lucide-react';
import NotFound from './NotFound';

export default function ServiceIndexPage() {
  const { serviceSlug } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: service, isLoading: serviceLoading } = useService(serviceSlug || '');
  const { data: services } = useServices();
  const { data: cities, isLoading: citiesLoading } = useCities();
  const { data: serviceContent } = useServiceContent(service?.id);

  const isLoading = serviceLoading || citiesLoading;

  // Get parent service for sub-services
  const parentService = useMemo(() => {
    if (!service?.parent_service_id || !services) return null;
    return services.find(s => s.id === service.parent_service_id);
  }, [service, services]);

  // Get sibling services (other sub-services of same parent)
  const siblingServices = useMemo(() => {
    if (!service || !services) return [];
    const parentId = service.parent_service_id;
    if (!parentId) {
      // This is a top-level service, get its children
      return services.filter(s => s.parent_service_id === service.id);
    }
    // This is a sub-service, get siblings
    return services.filter(s => s.parent_service_id === parentId && s.id !== service.id);
  }, [service, services]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!cities) return [];
    if (!searchQuery.trim()) return cities;
    const query = searchQuery.toLowerCase().trim();
    return cities.filter(city => city.name.toLowerCase().includes(query));
  }, [cities, searchQuery]);

  if (!serviceSlug) {
    return null;
  }

  if (!isLoading && !service) {
    return <NotFound />;
  }

  const breadcrumbs = [
    { label: 'Hem', href: '/' },
    ...(parentService ? [{ label: parentService.name, href: `/${parentService.slug}` }] : []),
    { label: service?.name || serviceSlug },
  ];

  const currentYear = new Date().getFullYear();
  const serviceName = service?.name || serviceSlug;
  const isSubService = !!service?.parent_service_id;
  
  const title = `${serviceName} i Sverige ${currentYear} | Hitta & Jämför`;
  const description = serviceContent?.intro_text 
    || `Hitta ${serviceName.toLowerCase()} i hela Sverige. Välj din stad och hitta pålitliga företag.`;

  // Generate dynamic intro
  const introText = serviceContent?.intro_text || (
    isSubService 
      ? `Letar du efter professionell hjälp med ${serviceName.toLowerCase()}? Välj din stad nedan för att hitta vår rekommenderade partner för ${serviceName.toLowerCase()}.`
      : `Hitta och jämför ${serviceName.toLowerCase()} i din stad. Vi hjälper dig hitta pålitliga företag baserat på kvalitet och kundbetyg.`
  );

  return (
    <Layout>
      <SEOHead
        title={title}
        description={description}
        canonical={`/${serviceSlug}`}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-primary/3 to-background pt-8 pb-12 lg:pt-12 lg:pb-16">
        <div className="container">
          <Breadcrumbs items={breadcrumbs} />

          {isLoading ? (
            <div className="space-y-4 mt-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ) : (
            <div className="mt-6 max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {service?.name} i Sverige {currentYear}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {introText}
              </p>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Kvalitetsgranskade partners</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Gratis offert</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>{cities?.length || 0}+ städer</span>
                </div>
              </div>

              {/* Search box */}
              <div className="max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Sök efter din stad..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-base rounded-2xl border-2 border-border bg-background focus:border-accent transition-colors shadow-soft"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* City grid */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {searchQuery.trim() 
                ? `Resultat för "${searchQuery}" (${filteredCities.length})`
                : 'Välj din stad'
              }
            </h2>
            {searchQuery.trim() && filteredCities.length === 0 && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-sm text-accent hover:underline"
              >
                Rensa sökning
              </button>
            )}
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : filteredCities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCities.map((city) => (
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
          ) : (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Ingen stad hittades för "{searchQuery}"
              </p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-2 text-accent hover:underline"
              >
                Visa alla städer
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Related services section */}
      {siblingServices.length > 0 && (
        <section className="py-12 lg:py-16 bg-secondary/30">
          <div className="container">
            <h2 className="text-2xl font-bold mb-6">
              {isSubService ? 'Relaterade tjänster' : 'Undertjänster'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {siblingServices.map((svc) => (
                <Link key={svc.id} to={`/${svc.slug}`}>
                  <Card className="p-4 hover:border-accent/50 hover:shadow-card transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-3 w-3 rounded-full bg-accent shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold group-hover:text-accent transition-colors">
                          {svc.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Hitta {svc.name.toLowerCase()} i Sverige
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Info section */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Om {service?.name?.toLowerCase()}
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                {serviceContent?.intro_text || 
                  `Vi hjälper dig hitta de bästa ${service?.name?.toLowerCase()} i hela Sverige. 
                  Vårt mål är att göra det enkelt att hitta pålitliga partners som kan hjälpa dig 
                  med ${service?.name?.toLowerCase()}.`
                }
              </p>
              <p>
                Alla våra rekommenderade partners har granskats för kvalitet och pålitlighet. 
                Fyll i ett enkelt formulär på stadssidan så kontaktar vår partner dig med en 
                kostnadsfri offert.
              </p>
            </div>

            {/* Tips if available */}
            {serviceContent?.tips && serviceContent.tips.length > 0 && (
              <div className="mt-8 p-6 bg-secondary/50 rounded-2xl">
                <h3 className="font-semibold text-lg mb-4">Tips inför {service?.name?.toLowerCase()}</h3>
                <ul className="space-y-3">
                  {serviceContent.tips.slice(0, 4).map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <CTASection serviceName={service?.name} />
    </Layout>
  );
}
