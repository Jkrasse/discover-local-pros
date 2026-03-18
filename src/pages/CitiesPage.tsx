import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { useCities } from '@/hooks/useCity';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, ChevronRight } from 'lucide-react';

const breadcrumbs = [
  { label: 'Hem', href: '/' },
  { label: 'Alla städer' },
];

export default function CitiesPage() {
  const { data: cities, isLoading } = useCities();
  const { data: settings } = useSiteSettings();
  const siteName = settings?.site_name || 'Katalog';

  return (
    <Layout>
      <SEOHead
        title="Alla städer | FlyttGuide"
        description="Hitta flyttfirmor i Sveriges alla städer. Välj din stad och hitta de bästa lokala företagen."
        canonical="/stader"
      />

      <section className="bg-gradient-to-b from-primary/5 to-background pt-8 pb-12 lg:pt-12 lg:pb-16">
        <div className="container">
          <Breadcrumbs items={breadcrumbs} />
          
          <div className="mt-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Alla städer
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Vi listar flyttfirmor i {cities?.length || 0} svenska städer. 
              Välj din stad nedan för att hitta de bästa lokala företagen.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cities?.map((city) => (
                <Link key={city.id} to={`/flyttfirmor/${city.slug}`}>
                  <Card className="p-5 h-full hover:border-accent/50 hover:shadow-card transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary group-hover:bg-accent/10 transition-colors">
                        <MapPin className="h-6 w-6 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-lg group-hover:text-accent transition-colors">
                          {city.name}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-1">
                          {city.region}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-1" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
