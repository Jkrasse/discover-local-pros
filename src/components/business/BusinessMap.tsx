import { lazy, Suspense, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Business } from '@/types/database';

// Lazy load the map component to avoid SSR issues
const BusinessMapInner = lazy(() => 
  import('./BusinessMapInner').then(module => ({ default: module.BusinessMapInner }))
);

interface BusinessMapProps {
  businesses: Business[];
  featuredBusinessId?: string;
  cityName: string;
  cityLat?: number | null;
  cityLng?: number | null;
  serviceSlug: string;
  citySlug: string;
}

export function BusinessMap({
  businesses,
  featuredBusinessId,
  cityName,
  cityLat,
  cityLng,
  serviceSlug,
  citySlug,
}: BusinessMapProps) {
  // Filter businesses with valid coordinates
  const businessesWithCoords = useMemo(
    () => businesses.filter((b) => b.lat != null && b.lng != null),
    [businesses]
  );

  if (businessesWithCoords.length === 0) {
    return null;
  }

  return (
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">
            Karta över företag i {cityName}
          </h2>
          <p className="text-muted-foreground mb-6">
            Se var alla {businessesWithCoords.length} företag finns på kartan
          </p>

          <div className="rounded-xl overflow-hidden border shadow-sm h-[400px] md:h-[500px]">
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
              <BusinessMapInner
                businesses={businesses}
                featuredBusinessId={featuredBusinessId}
                cityName={cityName}
                cityLat={cityLat}
                cityLng={cityLng}
                serviceSlug={serviceSlug}
                citySlug={citySlug}
              />
            </Suspense>
          </div>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Guldmarkör = Rekommenderad partner • Klicka på en markör för mer information
          </p>
        </div>
      </div>
    </section>
  );
}
