import { Link } from 'react-router-dom';
import { CheckCircle, Star, Shield, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeroSectionNewProps {
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
  businessCount?: number;
  reviewCount?: number;
}

export function HeroSectionNew({
  title,
  subtitle,
  breadcrumbs,
  businessCount = 0,
  reviewCount = 0,
}: HeroSectionNewProps) {
  const scrollToBusinesses = () => {
    document.getElementById('businesses')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-b from-primary/5 via-primary/3 to-background pt-8 pb-12 lg:pt-12 lg:pb-16">
      <div className="container">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mt-6 max-w-3xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-lg text-muted-foreground mb-6">
              {subtitle}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button 
              onClick={scrollToForm}
              size="lg" 
              className="btn-hero"
            >
              Få gratis offert
            </Button>
            <Button 
              onClick={scrollToBusinesses}
              variant="outline" 
              size="lg"
              className="gap-2"
            >
              <ArrowDown className="h-4 w-4" />
              Bläddra bland företag
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Gratis jämförelse</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4 text-featured" />
              <span>{businessCount} lokala företag</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4 text-accent" />
              <span>{reviewCount}+ verifierade omdömen</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}