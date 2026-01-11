import { Check, Lightbulb, ClipboardList, Shield, Clock, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface InfoSectionProps {
  serviceName: string;
  cityName: string;
  tips?: string[];
  checklist?: string[];
}

const defaultTips = [
  'Kontrollera att företaget har F-skatt och ansvarsförsäkring',
  'Läs omdömen och be om referenser från tidigare kunder',
  'Fråga om det finns dolda avgifter (trappor, långa bärvägar, etc.)',
  'Boka i god tid - särskilt vid månadsskiften och under sommaren',
  'Ta bilder på värdefulla föremål innan flytten',
];

const defaultChecklist = [
  'Packa saker du inte behöver i förväg',
  'Märk alla kartonger med innehåll och rum',
  'Ta bilder på elektronik innan du kopplar bort',
  'Ordna parkering för flyttbilen',
  'Meddela adressändring till Skatteverket',
  'Säg upp eller flytta elavtal, internet och försäkringar',
];

export function InfoSection({
  serviceName,
  cityName,
  tips = defaultTips,
  checklist = defaultChecklist,
}: InfoSectionProps) {
  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Allt du behöver veta om {serviceName.toLowerCase()} i {cityName}
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Att flytta kan vara stressigt, men med rätt förberedelser och en pålitlig partner 
            blir det betydligt enklare. Här är våra bästa tips.
          </p>

          {/* Key benefits */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent mx-auto mb-3">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Försäkrad flytt</h3>
              <p className="text-sm text-muted-foreground">
                Alla våra rekommenderade företag har fullgod ansvarsförsäkring
              </p>
            </Card>
            <Card className="p-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-featured/10 text-featured mx-auto mb-3">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Snabbt svar</h3>
              <p className="text-sm text-muted-foreground">
                Få svar på din förfrågan inom 24 timmar
              </p>
            </Card>
            <Card className="p-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success mx-auto mb-3">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Professionell hantering</h3>
              <p className="text-sm text-muted-foreground">
                Erfarenhet av alla typer av flyttar
              </p>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Tips */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-featured/10 text-featured">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Tips inför flytten</h3>
              </div>
              
              <ul className="space-y-3">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-4 w-4 mt-1 text-success shrink-0" />
                    <span className="text-sm text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Checklist */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Checklista inför flytten</h3>
              </div>
              
              <div className="space-y-3">
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-secondary">
                      <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}