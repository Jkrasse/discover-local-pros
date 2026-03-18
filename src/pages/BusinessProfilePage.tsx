import { useParams, Link, Navigate } from 'react-router-dom';
import { Star, Globe, MapPin, Clock, ChevronRight, ArrowLeft, Building2, CheckCircle, Phone } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { SEOHead } from '@/components/seo/SEOHead';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusiness } from '@/hooks/useBusiness';
import { useService } from '@/hooks/useService';
import { LeadForm } from '@/components/forms/LeadForm';
import { cn } from '@/lib/utils';
// Helper to parse categories - handles corrupted data
function parseCategories(categories: string[] | null): string[] {
  if (!categories || !Array.isArray(categories)) return [];
  
  // Filter out single character entries and short nonsense
  return categories.filter(cat => {
    if (typeof cat !== 'string') return false;
    // Only keep categories that are actual words (more than 2 chars and not just spaces)
    return cat.trim().length > 2;
  });
}

// Helper to check if description is valid text (not JSON)
function isValidDescription(description: string | null): boolean {
  if (!description) return false;
  // Check if it looks like JSON
  const trimmed = description.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return false;
  }
  return true;
}

// Helper to parse opening hours from various formats
function parseOpeningHours(openingHours: unknown): Record<string, string> | null {
  if (!openingHours || typeof openingHours !== 'object') return null;
  
  const hours = openingHours as Record<string, unknown>;
  const result: Record<string, string> = {};
  
  // Map Swedish day names to display
  const dayMapping: Record<string, string> = {
    'måndag': 'Måndag',
    'tisdag': 'Tisdag',
    'onsdag': 'Onsdag',
    'torsdag': 'Torsdag',
    'fredag': 'Fredag',
    'lördag': 'Lördag',
    'söndag': 'Söndag',
    'monday': 'Måndag',
    'tuesday': 'Tisdag',
    'wednesday': 'Onsdag',
    'thursday': 'Torsdag',
    'friday': 'Fredag',
    'saturday': 'Lördag',
    'sunday': 'Söndag',
  };
  
  for (const [key, value] of Object.entries(hours)) {
    const dayName = dayMapping[key.toLowerCase()];
    if (!dayName) continue;
    
    // Handle array values like ["07-17"]
    if (Array.isArray(value)) {
      result[dayName] = value[0] || 'Stängt';
    } else if (typeof value === 'string') {
      result[dayName] = value || 'Stängt';
    }
  }
  
  return Object.keys(result).length > 0 ? result : null;
}

// Ordered weekdays for display
const orderedWeekDays = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

export default function BusinessProfilePage() {
  const { serviceSlug, citySlug, businessSlug } = useParams<{
    serviceSlug: string;
    citySlug: string;
    businessSlug: string;
  }>();

  const { data: business, isLoading: businessLoading } = useBusiness(businessSlug || '');
  const { data: service, isLoading: serviceLoading } = useService(serviceSlug || '');

  // Redirect to parent service if this is a sub-service
  // Business pages should only exist under the main/parent service
  if (!serviceLoading && service?.parent_service_id && service?.parent_service) {
    const parentSlug = service.parent_service.slug;
    return <Navigate to={`/${parentSlug}/${citySlug}/${businessSlug}`} replace />;
  }

  if (businessLoading) {
    return (
      <Layout>
        <div className="container-wide py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!business) {
    return (
      <Layout>
        <SEOHead
          title="Företag hittades inte"
          description="Det begärda företaget kunde inte hittas."
        />
        <div className="container-wide py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Företag hittades inte</h1>
          <p className="text-muted-foreground mb-8">
            Det företag du letar efter finns inte eller har tagits bort.
          </p>
          <Link to={`/${serviceSlug}/${citySlug}`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tillbaka till listan
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const cityName = business.city?.name || citySlug;
  const serviceName = service?.name || serviceSlug;

  const breadcrumbItems = [
    { label: serviceName, href: `/${serviceSlug}` },
    { label: cityName, href: `/${serviceSlug}/${citySlug}` },
    { label: business.name },
  ];

  const validCategories = parseCategories(business.categories);

  return (
    <Layout>
      <SEOHead
        title={`${business.name} - ${serviceName} i ${cityName}`}
        description={isValidDescription(business.description) ? business.description! : `${business.name} erbjuder ${serviceName?.toLowerCase()} i ${cityName}. Läs omdömen och kontakta oss idag.`}
        canonical={`/${serviceSlug}/${citySlug}/${businessSlug}`}
      />

      <section className="bg-gradient-to-b from-secondary/50 to-background py-6 lg:py-8">
        <div className="container-wide">
          <Breadcrumbs items={breadcrumbItems} />

          {/* Back link */}
          <Link
            to={`/${serviceSlug}/${citySlug}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka till alla {serviceName?.toLowerCase()} i {cityName}
          </Link>

          {/* Hero section */}
          <div className="bg-background rounded-2xl border border-border p-6 lg:p-8 shadow-soft">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Logo/Image */}
              <div className="shrink-0">
                <div className="w-full lg:w-32 h-32 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                  {business.images?.[0] ? (
                    <img
                      src={business.images[0]}
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                    {business.name}
                  </h1>
                  {business.verified && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verifierad
                    </Badge>
                  )}
                </div>

                {/* Rating */}
                {business.rating && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-5 w-5',
                            i < Math.floor(business.rating!)
                              ? 'rating-star fill-featured'
                              : 'text-muted-foreground/30'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold">
                      {business.rating.toFixed(1)}
                    </span>
                    {business.review_count > 0 && (
                      <span className="text-muted-foreground">
                        ({business.review_count} omdömen)
                      </span>
                    )}
                  </div>
                )}

                {/* Categories - only show valid ones */}
                {validCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {validCategories.map((category, index) => (
                      <Badge key={index} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Contact info */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  {business.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{business.address}</span>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${business.phone}`} className="hover:text-foreground">
                        {business.phone}
                      </a>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground"
                      >
                        Besök webbplats
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA button - only website */}
              {business.website && (
                <div className="flex flex-col gap-3 lg:min-w-[200px]">
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" size="lg" className="w-full gap-2">
                      <Globe className="h-4 w-4" />
                      Besök webbplats
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="container-wide py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description - only show if it's valid text, not JSON */}
            {isValidDescription(business.description) && (
              <Card>
                <CardHeader>
                  <CardTitle>Om {business.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {business.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Images gallery */}
            {business.images && business.images.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Bilder</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {business.images.slice(0, 6).map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden bg-secondary"
                      >
                        <img
                          src={image}
                          alt={`${business.name} bild ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-featured" />
                  Omdömen
                </CardTitle>
              </CardHeader>
              <CardContent>
                {business.review_count > 0 ? (
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-4xl font-bold">{business.rating?.toFixed(1)}</span>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-6 w-6',
                              i < Math.floor(business.rating || 0)
                                ? 'rating-star fill-featured'
                                : 'text-muted-foreground/30'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Baserat på {business.review_count} omdömen från Google
                    </p>
                    {business.gbp_id && (
                      <a
                        href={`https://search.google.com/local/reviews?placeid=${business.gbp_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-accent hover:underline mt-4"
                      >
                        Läs alla omdömen på Google
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Inga omdömen tillgängliga ännu.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-6">
            {/* Lead Form - Primary CTA */}
            <Card className="border-accent/20 bg-gradient-to-b from-accent/5 to-background">
              <CardHeader>
                <CardTitle className="text-lg">
                  Få offerter från {serviceName?.toLowerCase()} i {cityName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Fyll i formuläret så kontaktar vi dig med prisuppgifter
                </p>
              </CardHeader>
              <CardContent>
                <LeadForm
                  cityId={business.city_id || undefined}
                  serviceId={service?.id}
                  sourceUrl={window.location.href}
                  compact
                />
              </CardContent>
            </Card>

            {/* Opening hours */}
            {(() => {
              const parsedHours = parseOpeningHours(business.opening_hours);
              return parsedHours ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Öppettider
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      {orderedWeekDays.map((day) => {
                        const hours = parsedHours[day];
                        return (
                          <div
                            key={day}
                            className="flex justify-between text-sm"
                          >
                            <dt className="font-medium">{day}</dt>
                            <dd className="text-muted-foreground">
                              {hours || 'Stängt'}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  </CardContent>
                </Card>
              ) : null;
            })()}

            {/* Location */}
            {business.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Plats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{business.address}</p>
                  {business.lat && business.lng && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full gap-2">
                        <MapPin className="h-4 w-4" />
                        Visa på karta
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick contact */}
            <Card className="bg-secondary/50">
              <CardHeader>
                <CardTitle>Kontakta {business.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="block">
                    <Button className="w-full gap-2">
                      <Phone className="h-4 w-4" />
                      {business.phone}
                    </Button>
                  </a>
                )}
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full gap-2">
                      <Globe className="h-4 w-4" />
                      Besök webbplats
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Back to list */}
      <section className="container-wide pb-12">
        <Link
          to={`/${serviceSlug}/${citySlug}`}
          className="inline-flex items-center gap-2 text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Se alla {serviceName?.toLowerCase()} i {cityName}
        </Link>
      </section>
    </Layout>
  );
}
