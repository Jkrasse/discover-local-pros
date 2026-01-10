import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  faqs: FAQItem[];
}

export function FAQSection({
  title = 'Vanliga frågor',
  faqs,
}: FAQSectionProps) {
  if (faqs.length === 0) return null;

  return (
    <section className="py-12 lg:py-16">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          {title}
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="bg-card rounded-lg border border-border px-6 data-[state=open]:shadow-soft"
              >
                <AccordionTrigger className="text-left font-medium hover:text-accent py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
