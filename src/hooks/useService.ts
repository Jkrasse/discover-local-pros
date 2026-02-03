import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Service } from '@/types/database';

export interface ServiceWithParent extends Service {
  parent_service?: Service | null;
}

export function useService(slug: string) {
  return useQuery({
    queryKey: ['service', slug],
    queryFn: async (): Promise<ServiceWithParent | null> => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          parent_service:services!services_parent_service_id_fkey(*)
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      // Transform parent_service from array to single object
      const result = {
        ...data,
        parent_service: Array.isArray(data.parent_service) 
          ? data.parent_service[0] || null 
          : data.parent_service
      } as ServiceWithParent;
      
      return result;
    },
    enabled: !!slug,
  });
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Service[];
    },
  });
}
