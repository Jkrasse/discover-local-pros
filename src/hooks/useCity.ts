import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { City } from '@/types/database';

export function useCity(slug: string) {
  return useQuery({
    queryKey: ['city', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as City | null;
    },
    enabled: !!slug,
  });
}

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('population', { ascending: false });

      if (error) throw error;
      return data as City[];
    },
  });
}
