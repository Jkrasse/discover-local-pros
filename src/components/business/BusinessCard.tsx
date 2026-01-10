import { Link } from 'react-router-dom';
import { Star, Phone, Globe, MapPin, Clock, ChevronRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Business } from '@/types/database';

interface BusinessCardProps {
  business: Business;
  serviceSlug: string;
  citySlug: string;
  isFeatured?: boolean;
  rank?: number;
}

export function BusinessCard({
  business,
  serviceSlug,
  citySlug,
  isFeatured = false,
  rank,
}: BusinessCardProps) {
  const profileUrl = `/${serviceSlug}/${citySlug}/${business.slug}`;

  return (
    <article
      className={cn(
        'group relative',
        isFeatured ? 'card-featured' : 'card-business'
      )}
    >
      {/* Featured badge */}
      {isFeatured && (
        <div className="absolute -top-3 left-4">
          <span className="badge-featured">
            <Award className="h-4 w-4" />
            Rekommenderad
          </span>
        </div>
      )}

      {/* Rank badge for non-featured */}
      {!isFeatured && rank && (
        <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground shadow-soft">
          #{rank}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Business image/logo placeholder */}
        <div className="shrink-0">
          <div
            className={cn(
              'w-full lg:w-24 h-20 lg:h-24 rounded-lg bg-secondary flex items-center justify-center',
              isFeatured && 'lg:w-28 lg:h-28'
            )}
          >
            {business.images?.[0] ? (
              <img
                src={business.images[0]}
                alt={business.name}
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {business.name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
            <div>
              <h3
                className={cn(
                  'font-semibold text-foreground group-hover:text-accent transition-colors',
                  isFeatured ? 'text-xl' : 'text-lg'
                )}
              >
                <Link to={profileUrl} className="hover:underline">
                  {business.name}
                </Link>
              </h3>

              {/* Rating */}
              {business.rating && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < Math.floor(business.rating!)
                            ? 'rating-star fill-featured'
                            : 'text-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {business.rating.toFixed(1)}
                  </span>
                  {business.review_count > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({business.review_count} omdömen)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Verified badge */}
            {business.verified && (
              <Badge variant="secondary" className="shrink-0">
                Verifierad
              </Badge>
            )}
          </div>

          {/* Description */}
          {business.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {business.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
            {business.address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[200px]">{business.address}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                <span>{business.phone}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {business.phone && (
              <a href={`tel:${business.phone}`}>
                <Button
                  variant={isFeatured ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'gap-2',
                    isFeatured && 'bg-accent hover:bg-accent/90'
                  )}
                >
                  <Phone className="h-4 w-4" />
                  Ring nu
                </Button>
              </a>
            )}
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  Webbplats
                </Button>
              </a>
            )}
            <Link to={profileUrl}>
              <Button variant="ghost" size="sm" className="gap-1">
                Mer info
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Transparency note for featured */}
      {isFeatured && (
        <div className="mt-4 pt-4 border-t border-featured/20">
          <p className="text-xs text-muted-foreground">
            Rekommenderad partner.{' '}
            <Link to="/hur-vi-rankar" className="underline hover:text-accent">
              Så väljer vi rekommenderad →
            </Link>
          </p>
        </div>
      )}
    </article>
  );
}
