import { BusinessCard } from './BusinessCard';
import type { Business } from '@/types/database';

interface BusinessListProps {
  businesses: Business[];
  featuredBusiness?: Business;
  serviceSlug: string;
  citySlug: string;
}

export function BusinessList({
  businesses,
  featuredBusiness,
  serviceSlug,
  citySlug,
}: BusinessListProps) {
  // Filter out featured business from the regular list
  const regularBusinesses = featuredBusiness
    ? businesses.filter((b) => b.id !== featuredBusiness.id)
    : businesses;

  // Show first 3 businesses in the grid
  const gridBusinesses = regularBusinesses.slice(0, 3);
  const remainingBusinesses = regularBusinesses.slice(3);

  if (businesses.length === 0 && !featuredBusiness) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Inga företag hittades för denna sökning.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="businesses">
      {/* Featured business */}
      {featuredBusiness && (
        <div>
          <BusinessCard
            business={featuredBusiness}
            serviceSlug={serviceSlug}
            citySlug={citySlug}
            isFeatured
          />
        </div>
      )}

      {/* Grid of 3 businesses */}
      {gridBusinesses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Fler företag i området
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {gridBusinesses.map((business, index) => (
              <BusinessCard
                key={business.id}
                business={business}
                serviceSlug={serviceSlug}
                citySlug={citySlug}
                rank={index + 1}
                variant="compact"
              />
            ))}
          </div>
        </div>
      )}

      {/* Remaining businesses */}
      {remainingBusinesses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Övriga {remainingBusinesses.length} företag
          </h3>
          <div className="space-y-4">
            {remainingBusinesses.map((business, index) => (
              <BusinessCard
                key={business.id}
                business={business}
                serviceSlug={serviceSlug}
                citySlug={citySlug}
                rank={gridBusinesses.length + index + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
