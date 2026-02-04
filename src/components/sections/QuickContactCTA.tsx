import { Phone, Star, CheckCircle2 } from 'lucide-react';
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

  return (
    <section className="py-16 bg-primary/5">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          {/* Header */}
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3">
            Ring vår rekommenderade partner direkt
          </h2>
          <p className="text-muted-foreground mb-8">
            Behöver du snabb {serviceName?.toLowerCase()} i {cityName}? Ring {business.name} direkt för personlig hjälp.
          </p>

          {/* Partner info card */}
          <div className="bg-background rounded-2xl border border-border p-6 md:p-8 shadow-soft inline-block w-full max-w-md">
            <div className="flex flex-col items-center gap-4">
              {/* Business name and badges */}
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{business.name}</h3>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {business.rating && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Star className="h-4 w-4 fill-featured text-featured" />
                      <span className="font-medium">{business.rating.toFixed(1)}</span>
                      {business.review_count && (
                        <span className="text-muted-foreground">({business.review_count} omdömen)</span>
                      )}
                    </div>
                  )}
                  {business.verified && (
                    <div className="flex items-center gap-1 text-sm text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verifierad</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone CTA */}
              <Button 
                asChild 
                size="lg" 
                className="w-full text-lg h-14 mt-2"
              >
                <a href={`tel:${business.phone.replace(/\s/g, '')}`}>
                  <Phone className="h-5 w-5" />
                  {business.phone}
                </a>
              </Button>

              <p className="text-xs text-muted-foreground">
                Öppet vardagar 08:00–17:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
