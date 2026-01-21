import { Card } from '@/components/ui/card';
import { LeadForm } from '@/components/forms/LeadForm';

interface QuoteFormSectionProps {
  serviceName: string;
  cityName: string;
  cityId?: string;
  serviceId?: string;
}

export function QuoteFormSection({ 
  serviceName, 
  cityName, 
  cityId, 
  serviceId 
}: QuoteFormSectionProps) {
  return (
    <section id="lead-form" className="py-16 lg:py-20 bg-secondary/50">
      <div className="container">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
          {/* Left content */}
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Få offert från {serviceName.toLowerCase()} i {cityName}
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Fyll i formuläret så kontaktar vår rekommenderade partner dig med en offert. 
              Det är helt gratis och utan förpliktelse.
            </p>
            
            <div className="space-y-6">
              <div className="quote-step">
                <div className="step-num">1</div>
                <div className="step-text">
                  <h4 className="font-heading font-bold text-foreground mb-1">Beskriv din flytt</h4>
                  <p className="text-sm text-muted-foreground">
                    Berätta var du ska flytta och vilken typ av bostad det gäller
                  </p>
                </div>
              </div>
              
              <div className="quote-step">
                <div className="step-num">2</div>
                <div className="step-text">
                  <h4 className="font-heading font-bold text-foreground mb-1">Få offert</h4>
                  <p className="text-sm text-muted-foreground">
                    Vår rekommenderade partner kontaktar dig inom 24 timmar
                  </p>
                </div>
              </div>
              
              <div className="quote-step">
                <div className="step-num">3</div>
                <div className="step-text">
                  <h4 className="font-heading font-bold text-foreground mb-1">Boka din flytt</h4>
                  <p className="text-sm text-muted-foreground">
                    Acceptera offerten och boka ett datum som passar dig
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form card */}
          <Card className="quote-form-card-styled">
            <h3 className="font-heading text-xl font-bold text-foreground mb-7">
              Fyll i dina uppgifter
            </h3>
            <LeadForm cityId={cityId} serviceId={serviceId} />
          </Card>
        </div>
      </div>
    </section>
  );
}
