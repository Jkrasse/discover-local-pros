import { Link } from 'react-router-dom';
import { 
  Phone, 
  Globe, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Award, 
  ChevronRight,
  Users,
  Calendar,
  Quote,
  ThumbsUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useBusinessReviews } from '@/hooks/useBusinessReviews';
import { Skeleton } from '@/components/ui/skeleton';

interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  rating?: number | null;
  review_count?: number | null;
  verified?: boolean | null;
  images?: string[] | null;
  categories?: string[] | null;
  employee_count?: string | null;
  founded_year?: number | null;
}

interface RecommendedPartnerCardProps {
  business: Business;
  serviceSlug: string;
  citySlug: string;
  serviceName?: string;
  cityName?: string;
}

export function RecommendedPartnerCard({ 
  business, 
  serviceSlug, 
  citySlug,
  serviceName = 'flyttfirma',
  cityName = ''
}: RecommendedPartnerCardProps) {
  const { data: reviews, isLoading: reviewsLoading } = useBusinessReviews(
    business.name,
    cityName,
    true
  );

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-5 w-5 fill-featured text-featured" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-5 w-5 fill-featured/50 text-featured" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-5 w-5 text-border" />
        );
      }
    }
    return stars;
  };

  const renderSmallStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-featured text-featured" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-border" />
        );
      }
    }
    return stars;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
  };

  // Generate dynamic recommendation content
  const getRecommendationReasons = () => {
    const reasons = [];
    
    if (business.rating && business.rating >= 4.5) {
      reasons.push(`Med ett betyg på ${business.rating.toFixed(1)} av 5 stjärnor tillhör ${business.name} de högst rankade ${serviceName}na i ${cityName}.`);
    } else if (business.rating && business.rating >= 4.0) {
      reasons.push(`${business.name} har ett utmärkt betyg på ${business.rating.toFixed(1)} av 5 stjärnor baserat på ${business.review_count || 'många'} kundrecensioner.`);
    }

    if (business.verified) {
      reasons.push(`Företaget är verifierat och har genomgått vår kvalitetskontroll för att säkerställa professionell service.`);
    }

    if (business.founded_year) {
      const yearsInBusiness = new Date().getFullYear() - business.founded_year;
      if (yearsInBusiness > 5) {
        reasons.push(`Med ${yearsInBusiness} års erfarenhet sedan ${business.founded_year} har ${business.name} etablerat sig som en pålitlig aktör i branschen.`);
      }
    }

    if (business.employee_count) {
      reasons.push(`Med ${business.employee_count} anställda har företaget kapacitet att hantera både små och stora uppdrag.`);
    }

    if (business.review_count && business.review_count > 50) {
      reasons.push(`Över ${business.review_count} nöjda kunder har delat sina positiva erfarenheter, vilket visar på konsekvent hög kvalitet.`);
    }

    // Always add a conclusion
    reasons.push(`Vi rekommenderar ${business.name} för deras kombination av professionalism, pålitlighet och kundnöjdhet.`);

    return reasons;
  };

  const formatReviewDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="recommended-card group">
      {/* Top gradient bar - shimmer effect */}
      <div className="recommended-card-shimmer" />
      
      {/* Badges */}
      <div className="absolute top-5 left-5 z-10">
        <div className="recommended-badge">
          <Award className="h-4 w-4" />
          <span>Rekommenderad</span>
        </div>
      </div>
      
      {business.verified && (
        <div className="absolute top-5 right-5 z-10">
          <div className="verified-badge">
            <CheckCircle2 className="h-4 w-4" />
            <span>Verifierad</span>
          </div>
        </div>
      )}

      {/* Decorative gradient orb */}
      <div className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-[1] mt-14">
        <div className="grid md:grid-cols-[auto_1fr_auto] gap-6 md:gap-7 items-start">
          {/* Logo */}
          <div className="company-logo-large">
            {business.images?.[0] ? (
              <img 
                src={business.images[0]} 
                alt={business.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span>{getInitials(business.name)}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-2">
              {business.name}
            </h3>
            
            {/* Rating */}
            {business.rating && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">
                  {renderStars(business.rating)}
                </div>
                <span className="font-bold text-foreground">{business.rating.toFixed(1)}</span>
                {business.review_count && (
                  <span className="text-muted-foreground text-sm">
                    ({business.review_count} omdömen)
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {business.description && (
              <p className="text-muted-foreground text-[15px] leading-relaxed mb-4 max-w-xl line-clamp-2">
                {business.description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 md:gap-5">
              {business.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground/60" />
                  <span>{business.address}</span>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground/60" />
                  <span>{business.phone}</span>
                </div>
              )}
              {business.employee_count && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-muted-foreground/60" />
                  <span>{business.employee_count} anställda</span>
                </div>
              )}
              {business.founded_year && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-muted-foreground/60" />
                  <span>Grundat {business.founded_year}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-row md:flex-col gap-3 md:min-w-[160px]">
            {business.phone && (
              <Button 
                asChild
                className="btn-call flex-1 md:flex-none"
              >
                <a href={`tel:${business.phone.replace(/\s/g, '')}`}>
                  <Phone className="h-4 w-4" />
                  Ring nu
                </a>
              </Button>
            )}
            {business.website && (
              <Button 
                variant="outline" 
                asChild
                className="flex-1 md:flex-none border-2"
              >
                <a href={business.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" />
                  Webbplats
                </a>
              </Button>
            )}
            <Link 
              to={`/${serviceSlug}/${citySlug}/${business.slug}`}
              className="btn-info-link"
            >
              Mer info
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Accordions Section */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <Accordion type="single" collapsible className="space-y-3">
            {/* Why we recommend accordion */}
            <AccordionItem 
              value="why-recommend" 
              className="bg-secondary/50 rounded-lg border border-border/50 px-5 data-[state=open]:shadow-soft"
            >
              <AccordionTrigger className="text-left font-medium hover:text-primary py-4 text-[15px]">
                <span className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Varför är {business.name} den bästa {serviceName}n i {cityName}?
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="space-y-3 text-muted-foreground text-[15px] leading-relaxed">
                  {getRecommendationReasons().map((reason, index) => (
                    <p key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                      <span>{reason}</span>
                    </p>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Reviews accordion */}
            <AccordionItem 
              value="reviews" 
              className="bg-secondary/50 rounded-lg border border-border/50 px-5 data-[state=open]:shadow-soft"
            >
              <AccordionTrigger className="text-left font-medium hover:text-primary py-4 text-[15px]">
                <span className="flex items-center gap-2">
                  <Quote className="h-4 w-4 text-primary" />
                  Vad säger användare om {business.name}?
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews && reviews.length > 0 ? (
                  <div className="space-y-5">
                    {reviews.map((review, index) => (
                      <div key={index} className="flex gap-4">
                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          {review.author_image ? (
                            <img 
                              src={review.author_image} 
                              alt={review.author_name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-primary">
                              {review.author_name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        {/* Review content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground text-sm">
                              {review.author_name}
                            </span>
                            {review.time && (
                              <span className="text-xs text-muted-foreground">
                                · {formatReviewDate(review.time)}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {renderSmallStars(review.rating)}
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            "{review.text}"
                          </p>
                          {review.likes !== undefined && review.likes > 0 && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{review.likes} tyckte detta var hjälpsamt</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Link to more reviews */}
                    <div className="pt-3 border-t border-border/50">
                      <Link 
                        to={`/${serviceSlug}/${citySlug}/${business.slug}#recensioner`}
                        className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
                      >
                        Visa alla omdömen
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Inga recensioner tillgängliga just nu. Besök{' '}
                    <Link 
                      to={`/${serviceSlug}/${citySlug}/${business.slug}`}
                      className="text-primary font-medium hover:underline"
                    >
                      företagets profil
                    </Link>{' '}
                    för mer information.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Footer */}
      <div className="recommended-card-footer">
        <p className="text-sm text-muted-foreground">
          Rekommenderad partner.{' '}
          <Link to="/hur-vi-rankar" className="text-primary font-semibold hover:underline">
            Så väljer vi rekommenderad →
          </Link>
        </p>
      </div>
    </div>
  );
}
