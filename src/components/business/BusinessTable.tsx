import { Link } from 'react-router-dom';
import { Star, MapPin, Phone, Award } from 'lucide-react';
import type { Business } from '@/types/database';

interface BusinessTableProps {
  businesses: Business[];
  featuredBusiness?: Business | null;
  serviceSlug: string;
  citySlug: string;
  cityName: string;
}

export function BusinessTable({
  businesses,
  featuredBusiness,
  serviceSlug,
  citySlug,
  cityName,
}: BusinessTableProps) {
  // Combine featured business at the top with other businesses
  const allBusinesses = featuredBusiness 
    ? [featuredBusiness, ...businesses.filter(b => b.id !== featuredBusiness.id)]
    : businesses;

  if (allBusinesses.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-secondary/30">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">
              Alla {serviceSlug === 'flyttfirmor' ? 'flyttfirmor' : 'företag'} i {cityName}
            </h2>
            <p className="text-muted-foreground">
              Jämför {allBusinesses.length} {serviceSlug === 'flyttfirmor' ? 'flyttfirmor' : 'företag'} i {cityName} baserat på omdömen och betyg.
            </p>
          </div>

          <div className="companies-list-card">
            {/* Header row */}
            <div className="company-row header">
              <span>Företag</span>
              <span>Betyg</span>
              <span className="hidden md:block">Telefon</span>
              <span className="hidden lg:block">Adress</span>
            </div>

            {/* Business rows */}
            {allBusinesses.map((business) => {
              const isFeatured = featuredBusiness && business.id === featuredBusiness.id;
              
              return (
                <Link 
                  key={business.id}
                  to={`/${serviceSlug}/${citySlug}/${business.slug}`}
                  className={`company-row cursor-pointer ${isFeatured ? 'bg-accent/5 border-l-4 border-l-accent' : ''}`}
                >
                  {/* Company name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-foreground truncate">
                      {business.name}
                    </span>
                    {isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-accent-foreground bg-gradient-to-r from-accent to-featured flex-shrink-0">
                        <Award className="h-3 w-3" />
                        Rekommenderad
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5">
                    {business.rating ? (
                      <>
                        <Star className="h-4 w-4 text-featured fill-featured flex-shrink-0" />
                        <span className="font-semibold text-foreground">{business.rating.toFixed(1)}</span>
                        {business.review_count && (
                          <span className="text-muted-foreground text-sm">
                            ({business.review_count})
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground text-sm">Inga omdömen</span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
                    {business.phone ? (
                      <>
                        <Phone className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
                        <span className="truncate">{business.phone}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground/50">-</span>
                    )}
                  </div>

                  {/* Address */}
                  <div className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
                    {business.address ? (
                      <>
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
                        <span className="truncate">{business.address}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground/50">-</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
