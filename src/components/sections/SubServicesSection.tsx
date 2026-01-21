import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSubServices } from '@/hooks/useSubServices';

interface SubServicesSectionProps {
  parentServiceId: string;
  parentServiceName: string;
  citySlug: string;
  cityName: string;
}

export function SubServicesSection({
  parentServiceId,
  parentServiceName,
  citySlug,
  cityName,
}: SubServicesSectionProps) {
  const { data: subServices, isLoading } = useSubServices(parentServiceId);

  if (isLoading || !subServices || subServices.length === 0) {
    return null;
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">
              Specialiserade tjänster i {cityName}
            </h2>
            <p className="text-muted-foreground">
              Utöver {parentServiceName.toLowerCase()} erbjuder vi även hjälp med dessa relaterade tjänster.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {subServices.map((service) => (
              <Link
                key={service.id}
                to={`/${service.slug}/${citySlug}`}
                className="service-link-card"
              >
                <span className="font-semibold">{service.name} {cityName}</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
