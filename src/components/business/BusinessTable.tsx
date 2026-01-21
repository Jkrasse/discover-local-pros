import { Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Business } from '@/types/database';

interface BusinessTableProps {
  businesses: Business[];
  serviceSlug: string;
  citySlug: string;
  cityName: string;
}

export function BusinessTable({
  businesses,
  serviceSlug,
  citySlug,
  cityName,
}: BusinessTableProps) {
  if (businesses.length === 0) {
    return null;
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <section className="py-16 lg:py-20 bg-secondary/30">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">
              Andra {serviceSlug === 'flyttfirmor' ? 'flyttfirmor' : 'företag'} i {cityName}
            </h2>
            <p className="text-muted-foreground">
              Här är fler företag som erbjuder {serviceSlug === 'flyttfirmor' ? 'flyttjänster' : 'tjänster'} i {cityName}.
            </p>
          </div>

          <div className="companies-list-card">
            {/* Header row */}
            <div className="company-row header">
              <span>Företag</span>
              <span>Omdöme</span>
              <span className="hidden md:block">Adress</span>
              <span className="hidden lg:block">Kategorier</span>
            </div>

            {/* Business rows */}
            {businesses.map((business) => (
              <Link 
                key={business.id}
                to={`/${serviceSlug}/${citySlug}/${business.slug}`}
                className="company-row hover:bg-secondary/50 cursor-pointer block"
              >
                {/* Company info */}
                <div className="flex items-center gap-4">
                  <div className="company-row-logo">
                    {business.images?.[0] ? (
                      <img 
                        src={business.images[0]} 
                        alt={business.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      getInitials(business.name)
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground flex items-center flex-wrap gap-2">
                      {business.name}
                    </div>
                    {business.verified && (
                      <div className="flex items-center gap-1 text-primary text-xs font-semibold mt-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verifierad
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  {business.rating ? (
                    <>
                      <Star className="h-4 w-4 text-featured fill-featured" />
                      <span className="font-semibold text-foreground">{business.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm">
                        ({business.review_count})
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </div>

                {/* Address - hidden on mobile */}
                <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
                  {business.address ? (
                    <>
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
                      <span className="truncate max-w-[160px]">{business.address}</span>
                    </>
                  ) : (
                    <span>-</span>
                  )}
                </div>

                {/* Categories - hidden on mobile/tablet */}
                <div className="hidden lg:flex flex-wrap gap-1.5">
                  {business.categories && business.categories.length > 0 ? (
                    <>
                      {business.categories.slice(0, 2).map((category, i) => (
                        <span 
                          key={i} 
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground"
                        >
                          {category}
                        </span>
                      ))}
                      {business.categories.length > 2 && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-border/50 text-muted-foreground">
                          +{business.categories.length - 2}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
