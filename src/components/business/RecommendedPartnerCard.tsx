import { Link } from 'react-router-dom';
import { 
  Phone, 
  Globe, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Award, 
  ChevronRight,
  Building2,
  Users,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
}

export function RecommendedPartnerCard({ 
  business, 
  serviceSlug, 
  citySlug 
}: RecommendedPartnerCardProps) {
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

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
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
