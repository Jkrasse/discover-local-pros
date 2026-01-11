import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Service } from '@/types/database';

export function useSubServices(parentServiceId: string | undefined) {
  return useQuery({
    queryKey: ['sub-services', parentServiceId],
    queryFn: async () => {
      if (!parentServiceId) return [];

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('parent_service_id', parentServiceId)
        .order('name');

      if (error) throw error;
      return data as Service[];
    },
    enabled: !!parentServiceId,
  });
}
