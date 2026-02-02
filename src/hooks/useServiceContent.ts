import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ServiceContent {
  intro_text: string | null;
  tips: string[];
  checklist: string[];
  faqs: { question: string; answer: string }[];
  feature_cards: { title: string; description: string }[];
}

interface ServiceWithTemplates {
  intro_template: string | null;
  tips_template: string[] | null;
  checklist_template: string[] | null;
  faqs_template: { question: string; answer: string }[] | null;
  feature_cards_template: { title: string; description: string }[] | null;
  parent_service_id: string | null;
}

// Default content for fallback
const defaultContent: ServiceContent = {
  intro_text: null,
  tips: [
    'Kontrollera att företaget har F-skatt och ansvarsförsäkring',
    'Läs omdömen och be om referenser från tidigare kunder',
    'Fråga om det finns dolda avgifter',
    'Boka i god tid - särskilt vid högsäsong',
    'Ta bilder på värdefulla föremål innan tjänsten utförs',
  ],
  checklist: [
    'Förbered det som ska hanteras',
    'Dokumentera nuvarande skick',
    'Ordna tillgång och parkering',
    'Säkerställ försäkringsskydd',
    'Bekräfta datum och tid',
    'Spara kontaktuppgifter',
  ],
  faqs: [],
  feature_cards: [
    { title: 'Försäkrad tjänst', description: 'Våra rekommenderade företag har fullgod ansvarsförsäkring' },
    { title: 'Snabbt svar', description: 'Få svar på din förfrågan inom 24 timmar' },
    { title: 'Professionell hantering', description: 'Erfarenhet av alla typer av uppdrag' },
  ],
};

export function useServiceContent(serviceId?: string, cityId?: string) {
  return useQuery({
    queryKey: ['service-content', serviceId, cityId],
    queryFn: async (): Promise<ServiceContent> => {
      if (!serviceId) return defaultContent;

      // First, try to get city-specific content
      if (cityId) {
        const { data: cityContent } = await supabase
          .from('service_content')
          .select('intro_text, tips, checklist, faqs, feature_cards')
          .eq('service_id', serviceId)
          .eq('city_id', cityId)
          .maybeSingle();

        if (cityContent && cityContent.intro_text) {
          return {
            intro_text: cityContent.intro_text,
            tips: (cityContent.tips as string[]) || defaultContent.tips,
            checklist: (cityContent.checklist as string[]) || defaultContent.checklist,
            faqs: (cityContent.faqs as { question: string; answer: string }[]) || [],
            feature_cards: (cityContent.feature_cards as { title: string; description: string }[]) || defaultContent.feature_cards,
          };
        }
      }

      // Fall back to service-level template
      const { data: service } = await supabase
        .from('services')
        .select('intro_template, tips_template, checklist_template, faqs_template, feature_cards_template, parent_service_id')
        .eq('id', serviceId)
        .maybeSingle();

      if (service) {
        const typedService = service as unknown as ServiceWithTemplates;
        
        // If this service has templates, use them
        if (typedService.intro_template) {
          return {
            intro_text: typedService.intro_template,
            tips: (typedService.tips_template as string[]) || defaultContent.tips,
            checklist: (typedService.checklist_template as string[]) || defaultContent.checklist,
            faqs: (typedService.faqs_template as { question: string; answer: string }[]) || [],
            feature_cards: (typedService.feature_cards_template as { title: string; description: string }[]) || defaultContent.feature_cards,
          };
        }

        // If it's a sub-service, try to get parent's templates
        if (typedService.parent_service_id) {
          const { data: parentService } = await supabase
            .from('services')
            .select('intro_template, tips_template, checklist_template, faqs_template, feature_cards_template')
            .eq('id', typedService.parent_service_id)
            .maybeSingle();

          if (parentService) {
            const typedParent = parentService as unknown as ServiceWithTemplates;
            if (typedParent.intro_template) {
              return {
                intro_text: typedParent.intro_template,
                tips: (typedParent.tips_template as string[]) || defaultContent.tips,
                checklist: (typedParent.checklist_template as string[]) || defaultContent.checklist,
                faqs: (typedParent.faqs_template as { question: string; answer: string }[]) || [],
                feature_cards: (typedParent.feature_cards_template as { title: string; description: string }[]) || defaultContent.feature_cards,
              };
            }
          }
        }
      }

      return defaultContent;
    },
    enabled: !!serviceId,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}
