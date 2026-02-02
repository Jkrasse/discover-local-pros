import { Check, Lightbulb, ClipboardList, Shield, Clock, BadgeCheck } from 'lucide-react';

interface FeatureCard {
  title: string;
  description: string;
}

interface InfoSectionProps {
  serviceName: string;
  cityName: string;
  tips?: string[];
  checklist?: string[];
  featureCards?: FeatureCard[];
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

const defaultFeatureCards: FeatureCard[] = [
  { title: 'Försäkrad flytt', description: 'Alla våra rekommenderade företag har fullgod ansvarsförsäkring' },
  { title: 'Snabbt svar', description: 'Få svar på din förfrågan inom 24 timmar' },
  { title: 'Professionell hantering', description: 'Erfarenhet av alla typer av flyttar' },
];

export function InfoSection({
  serviceName,
  cityName,
  tips = defaultTips,
  checklist = defaultChecklist,
  featureCards = defaultFeatureCards,
}: InfoSectionProps) {
  return (
    <section className="py-16 lg:py-20">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
              Allt du behöver veta om {serviceName.toLowerCase()} i {cityName}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Att flytta kan vara stressigt, men med rätt förberedelser och en pålitlig partner 
              blir det betydligt enklare. Här är våra bästa tips.
            </p>
          </div>

          {/* Feature cards - dynamically rendered */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {featureCards.map((card, index) => {
              const icons = [Shield, Clock, BadgeCheck];
              const Icon = icons[index % icons.length];
              return (
                <div key={index} className="feature-card-new">
                  <div className="feature-icon">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Tips and Checklist cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tips */}
            <div className="tips-card-styled">
              <div className="card-header">
                <div className="card-header-icon">
                  <Lightbulb />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">Tips inför flytten</h3>
              </div>
              
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-[18px] w-[18px] text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div className="tips-card-styled">
              <div className="card-header">
                <div className="card-header-icon">
                  <ClipboardList />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground">Checklista inför flytten</h3>
              </div>
              
              <div className="space-y-3">
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
                    </div>
                    <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
