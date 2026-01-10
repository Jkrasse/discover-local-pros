import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { City } from '@/types/database';

interface CityGridProps {
  cities: City[];
  serviceSlug: string;
  serviceName: string;
}

export function CityGrid({ cities, serviceSlug, serviceName }: CityGridProps) {
  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          {serviceName} i hela Sverige
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Välj din stad för att hitta de bästa {serviceName.toLowerCase()} nära dig.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cities.map((city) => (
            <Link key={city.id} to={`/${serviceSlug}/${city.slug}`}>
              <Card className="p-4 h-full hover:border-accent/50 hover:shadow-card transition-all group">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary group-hover:bg-accent/10 transition-colors">
                    <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground group-hover:text-accent transition-colors truncate">
                      {city.name}
                    </h3>
                    {city.region && (
                      <p className="text-sm text-muted-foreground truncate">
                        {city.region}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
