import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Business, City } from '@/types/database';

interface BusinessWithCity extends Business {
  city: City | null;
}

export function useBusiness(businessSlug: string) {
  return useQuery({
    queryKey: ['business', businessSlug],
    queryFn: async (): Promise<BusinessWithCity | null> => {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          city:cities(*)
        `)
        .eq('slug', businessSlug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      
      return data as BusinessWithCity | null;
    },
    enabled: !!businessSlug,
  });
}

export function useBusinessReviews(businessId: string) {
  // Placeholder for future review integration
  // Could fetch from Google Places API or internal reviews table
  return useQuery({
    queryKey: ['business-reviews', businessId],
    queryFn: async () => {
      // For now, return empty array - could be extended later
      return [];
    },
    enabled: !!businessId,
  });
}
