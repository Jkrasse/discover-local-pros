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
      // First, get the service
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      // If it has a parent, fetch it separately
      let parent_service: Service | null = null;
      if (data.parent_service_id) {
        const { data: parentData } = await supabase
          .from('services')
          .select('*')
          .eq('id', data.parent_service_id)
          .maybeSingle();
        parent_service = parentData;
      }
      
      return {
        ...data,
        parent_service
      } as ServiceWithParent;
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
