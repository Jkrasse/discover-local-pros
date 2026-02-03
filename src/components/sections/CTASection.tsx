import { LeadForm } from '@/components/forms/LeadForm';
import { FileText, Phone, Shield } from 'lucide-react';
import { useSiteSettings, getPrimaryServiceName } from '@/hooks/useSiteSettings';

export interface CTASectionProps {
  title?: string;
  subtitle?: string;
  cityId?: string;
  serviceId?: string;
  cityName?: string;
  serviceName?: string;
}

export function CTASection({
  title,
  subtitle,
  cityId,
  serviceId,
}: CTASectionProps) {
  const { data: settings } = useSiteSettings();
  const primaryCategory = settings?.primary_service_category || 'other';
  const primaryServiceTerm = getPrimaryServiceName(primaryCategory);

  const displayTitle = title || 'Få gratis offert';
  const displaySubtitle = subtitle || `Fyll i formuläret så kontaktar vi dig med offerter från pålitliga ${primaryServiceTerm}.`;

  const benefits = [
    {
      icon: FileText,
      title: 'Gratis & utan förpliktelse',
      description: 'Det kostar ingenting att få offerter. Du väljer själv om du vill gå vidare.',
    },
    {
      icon: Phone,
      title: 'Snabbt svar',
      description: 'Vi återkommer inom 24 timmar med offerter från företag i ditt område.',
    },
    {
      icon: Shield,
      title: 'Kvalitetssäkrade företag',
      description: 'Alla företag är granskade och har bra omdömen från tidigare kunder.',
    },
  ];

  return (
    <section className="py-24">
      <div className="container">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.3fr] gap-16 items-start">
          {/* Content */}
          <div>
            <h2 className="text-3xl lg:text-[44px] font-bold tracking-tight leading-tight mb-5">
              {displayTitle}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10">
              {displaySubtitle}
            </p>

            <div className="space-y-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="benefit-item">
                  <div className="benefit-icon">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[17px] mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="quote-form-card">
            <h3 className="text-2xl font-bold mb-8">Fyll i dina uppgifter</h3>
            <LeadForm cityId={cityId} serviceId={serviceId} />
          </div>
        </div>
      </div>
    </section>
  );
}
