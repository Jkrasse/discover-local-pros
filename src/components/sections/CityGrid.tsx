import { Link } from 'react-router-dom';
import { MapPin, ChevronRight } from 'lucide-react';
import { useCities } from '@/hooks/useCity';
import type { City } from '@/types/database';

export interface CityGridProps {
  cities?: City[];
  serviceSlug: string;
  serviceName: string;
  excludeCitySlug?: string;
}

export function CityGrid({ cities: propCities, serviceSlug, serviceName, excludeCitySlug }: CityGridProps) {
  const { data: fetchedCities } = useCities();
  const cities = propCities || fetchedCities || [];
  const filteredCities = excludeCitySlug ? cities.filter(c => c.slug !== excludeCitySlug) : cities;
  
  return (
    <section className="py-16 lg:py-20 bg-secondary/30">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              {serviceName} i hela Sverige
            </h2>
            <p className="text-lg text-muted-foreground">
              Välj din stad för att hitta de bästa {serviceName.toLowerCase()} nära dig.
            </p>
          </div>

          {/* City grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCities.map((city) => (
              <Link key={city.id} to={`/${serviceSlug}/${city.slug}`} className="city-card-new">
                <div className="city-icon-new">
                  <MapPin className="h-[18px] w-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-[15px] text-foreground block truncate">
                    {city.name}
                  </span>
                  {city.region && (
                    <span className="text-xs text-muted-foreground truncate block">
                      {city.region}
                    </span>
                  )}
                </div>
                <ChevronRight className="h-[18px] w-[18px] text-muted-foreground transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
