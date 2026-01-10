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
    <div className="space-y-6">
      {/* Featured business */}
      {featuredBusiness && (
        <div className="mb-8">
          <BusinessCard
            business={featuredBusiness}
            serviceSlug={serviceSlug}
            citySlug={citySlug}
            isFeatured
          />
        </div>
      )}

      {/* Regular businesses */}
      {regularBusinesses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Övriga {regularBusinesses.length} företag
          </h2>
          <div className="space-y-4">
            {regularBusinesses.map((business, index) => (
              <BusinessCard
                key={business.id}
                business={business}
                serviceSlug={serviceSlug}
                citySlug={citySlug}
                rank={index + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
