import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
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
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Specialiserade tjänster i {cityName}
          </h2>
          <p className="text-muted-foreground mb-8">
            Utöver {parentServiceName.toLowerCase()} erbjuder vi även hjälp med dessa relaterade tjänster.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subServices.map((service) => (
              <Link
                key={service.id}
                to={`/${service.slug}/${citySlug}`}
              >
                <Card className="p-5 h-full hover:shadow-lg hover:border-accent/50 transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                        {service.name} {cityName}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
