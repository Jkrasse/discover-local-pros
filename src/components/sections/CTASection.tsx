import { Card } from '@/components/ui/card';
import { LeadForm } from '@/components/forms/LeadForm';
import { FileText, Phone, Shield } from 'lucide-react';

export interface CTASectionProps {
  title?: string;
  subtitle?: string;
  cityId?: string;
  serviceId?: string;
  cityName?: string;
  serviceName?: string;
}

export function CTASection({
  title = 'Få gratis offert',
  subtitle = 'Fyll i formuläret så kontaktar vi dig med offerter från pålitliga flyttfirmor.',
  cityId,
  serviceId,
}: CTASectionProps) {
  return (
    <section className="py-12 lg:py-16 bg-secondary/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
            <p className="text-lg text-muted-foreground mb-8">{subtitle}</p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Gratis & utan förpliktelse</h3>
                  <p className="text-sm text-muted-foreground">
                    Det kostar ingenting att få offerter. Du väljer själv om du
                    vill gå vidare.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Snabbt svar</h3>
                  <p className="text-sm text-muted-foreground">
                    Vi återkommer inom 24 timmar med offerter från företag i ditt
                    område.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Kvalitetssäkrade företag</h3>
                  <p className="text-sm text-muted-foreground">
                    Alla företag är granskade och har bra omdömen från tidigare
                    kunder.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <Card className="p-6 lg:p-8 shadow-card">
            <h3 className="text-xl font-semibold mb-6">Fyll i dina uppgifter</h3>
            <LeadForm cityId={cityId} serviceId={serviceId} />
          </Card>
        </div>
      </div>
    </section>
  );
}
