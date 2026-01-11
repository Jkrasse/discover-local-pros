import { Check, Lightbulb, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PriceRow {
  type: string;
  price: string;
}

interface InfoSectionProps {
  serviceName: string;
  cityName: string;
  prices?: PriceRow[];
  tips?: string[];
  checklist?: string[];
}

const defaultPrices: PriceRow[] = [
  { type: '1 rum & kök', price: '2 500 - 4 500 kr' },
  { type: '2 rum & kök', price: '4 000 - 7 000 kr' },
  { type: '3 rum & kök', price: '6 000 - 10 000 kr' },
  { type: '4+ rum', price: '8 000 - 15 000 kr' },
  { type: 'Villa', price: '12 000 - 25 000 kr' },
];

const defaultTips = [
  'Jämför alltid minst 3 offerter innan du bestämmer dig',
  'Kontrollera att företaget har F-skatt och ansvarsförsäkring',
  'Läs omdömen och be om referenser från tidigare kunder',
  'Fråga om det finns dolda avgifter (trappor, långa bärvägar, etc.)',
  'Boka i god tid - särskilt vid månadsskiften och under sommaren',
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
  prices = defaultPrices,
  tips = defaultTips,
  checklist = defaultChecklist,
}: InfoSectionProps) {
  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Allt du behöver veta om {serviceName.toLowerCase()} i {cityName}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Price Guide */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Prisguide {cityName}</h3>
              </div>
              
              <div className="space-y-2">
                {prices.map((row, index) => (
                  <div 
                    key={index}
                    className="flex justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="text-muted-foreground">{row.type}</span>
                    <span className="font-medium">{row.price}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                * Priserna är ungefärliga och varierar beroende på avstånd, våning och tjänster.
              </p>
            </Card>

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
          </div>

          {/* Checklist */}
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">Checklista inför flytten</h3>
            <div className="grid sm:grid-cols-2 gap-3">
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
    </section>
  );
}