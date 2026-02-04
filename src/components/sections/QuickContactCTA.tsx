import { Phone, Star, CheckCircle2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Business {
  id: string;
  name: string;
  phone?: string | null;
  rating?: number | null;
  review_count?: number | null;
  verified?: boolean | null;
}

interface QuickContactCTAProps {
  business: Business | null | undefined;
  serviceName?: string;
  cityName?: string;
}

export function QuickContactCTA({ business, serviceName = 'hjälp', cityName = '' }: QuickContactCTAProps) {
  if (!business?.phone) return null;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-featured text-featured" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-featured/50 text-featured" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-border" />
        );
      }
    }
    return stars;
  };

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          {/* Card */}
          <div className="bg-background rounded-2xl border border-border p-6 md:p-8 shadow-soft relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              {/* Left: Info */}
              <div className="flex-1 min-w-0">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                  <Award className="h-3.5 w-3.5" />
                  <span>Rekommenderad partner</span>
                </div>

                <h3 className="text-xl font-bold mb-2">{business.name}</h3>
                
                <div className="flex items-center gap-3 flex-wrap text-sm">
                  {business.rating && (
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {renderStars(business.rating)}
                      </div>
                      <span className="font-medium">{business.rating.toFixed(1)}</span>
                      {business.review_count && (
                        <span className="text-muted-foreground">({business.review_count})</span>
                      )}
                    </div>
                  )}
                  {business.verified && (
                    <div className="flex items-center gap-1 text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verifierad</span>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground text-sm mt-3 hidden md:block">
                  Behöver du snabb {serviceName?.toLowerCase()} i {cityName}? Ring direkt för personlig hjälp.
                </p>
              </div>

              {/* Right: Phone CTA */}
              <div className="flex flex-col items-center md:items-end gap-2">
                <Button asChild size="default">
                  <a href={`tel:${business.phone.replace(/\s/g, '')}`}>
                    <Phone className="h-4 w-4" />
                    {business.phone}
                  </a>
                </Button>
                <span className="text-xs text-muted-foreground">
                  Vardagar 08–17
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
