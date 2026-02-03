import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  partner_email: string;
  company_name: string;
  company_address: string;
  primary_service_category: string;
  hero_headline: string;
  hero_highlight: string;
}

const defaultSettings: SiteSettings = {
  site_name: 'Katalog',
  site_description: 'Hitta de bästa företagen',
  contact_email: 'info@example.com',
  contact_phone: '',
  partner_email: 'partner@example.com',
  company_name: 'Företagsnamn AB',
  company_address: 'Adress, Stad',
  primary_service_category: 'other',
  hero_headline: 'Hitta rätt företag',
  hero_highlight: 'för dig',
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (error) throw error;

      const settings = { ...defaultSettings };
      
      if (data) {
        data.forEach((row) => {
          const key = row.key as keyof SiteSettings;
          if (key in settings && row.value !== null) {
            // Handle both string values and JSON-wrapped strings
            const value = row.value;
            settings[key] = typeof value === 'string' ? value : String(value);
          }
        });
      }

      return settings;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

// Helper to get primary service name based on category
export function getPrimaryServiceName(category: string): string {
  const names: Record<string, string> = {
    moving: 'flyttfirmor',
    cleaning: 'städfirmor',
    dental: 'tandläkare',
    other: 'företag',
  };
  return names[category] || 'företag';
}

// Helper to get generic service term
export function getGenericServiceTerm(category: string): string {
  const terms: Record<string, string> = {
    moving: 'flytt',
    cleaning: 'städning',
    dental: 'tandvård',
    other: 'tjänster',
  };
  return terms[category] || 'tjänster';
}
