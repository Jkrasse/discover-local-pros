import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  cityName?: string;
  serviceName?: string;
  showCTA?: boolean;
  ctaLink?: string;
  updatedDate?: string;
}

export function HeroSection({
  title,
  subtitle,
  cityName,
  serviceName,
  showCTA = true,
  ctaLink = '/fa-offert',
  updatedDate,
}: HeroSectionProps) {
  const displayDate = updatedDate || new Date().toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="hero-gradient text-white py-12 lg:py-20">
      <div className="container">
        <div className="max-w-3xl">
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-white/80 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Uppdaterat: {displayDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              <span>Opartiskt urval</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Trust points */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <CheckCircle className="h-4 w-4 text-featured" />
              <span>Baserat på omdömen</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <CheckCircle className="h-4 w-4 text-featured" />
              <span>Lokal närvaro</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <CheckCircle className="h-4 w-4 text-featured" />
              <span>Gratis offertförfrågan</span>
            </div>
          </div>

          {/* CTA */}
          {showCTA && (
            <div className="flex flex-wrap gap-4">
              <Link to={ctaLink}>
                <Button className="btn-hero" size="lg">
                  Få gratis offert
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/hur-vi-rankar">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  Så väljer vi rekommenderad
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
