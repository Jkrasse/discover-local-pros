import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Business } from '@/types/database';

interface UseBusinessesOptions {
  cityId?: string;
  serviceId?: string;
  citySlug?: string;
  serviceSlug?: string;
}

export function useBusinesses(options: UseBusinessesOptions = {}) {
  const { citySlug, serviceSlug } = options;

  return useQuery({
    queryKey: ['businesses', citySlug, serviceSlug],
    queryFn: async () => {
      // First get city and service IDs from slugs
      let cityId = options.cityId;
      let serviceId = options.serviceId;

      if (citySlug && !cityId) {
        const { data: city } = await supabase
          .from('cities')
          .select('id')
          .eq('slug', citySlug)
          .maybeSingle();
        cityId = city?.id;
      }

      if (serviceSlug && !serviceId) {
        const { data: service } = await supabase
          .from('services')
          .select('id')
          .eq('slug', serviceSlug)
          .maybeSingle();
        serviceId = service?.id;
      }

      if (!cityId || !serviceId) {
        return [];
      }

      // Get businesses through business_service_coverage
      const { data: coverage, error: coverageError } = await supabase
        .from('business_service_coverage')
        .select('business_id')
        .eq('city_id', cityId)
        .eq('service_id', serviceId);

      if (coverageError) throw coverageError;

      if (!coverage || coverage.length === 0) {
        return [];
      }

      const businessIds = coverage.map((c) => c.business_id);

      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('*')
        .in('id', businessIds)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return businesses as Business[];
    },
    enabled: !!(citySlug && serviceSlug) || !!(options.cityId && options.serviceId),
  });
}

export function useFeaturedBusiness(citySlug: string, serviceSlug: string) {
  return useQuery({
    queryKey: ['featured-business', citySlug, serviceSlug],
    queryFn: async () => {
      // Get city and service IDs
      const [cityResult, serviceResult] = await Promise.all([
        supabase.from('cities').select('id').eq('slug', citySlug).maybeSingle(),
        supabase.from('services').select('id').eq('slug', serviceSlug).maybeSingle(),
      ]);

      if (!cityResult.data?.id || !serviceResult.data?.id) {
        return null;
      }

      // Get active featured slot
      const { data: featuredSlot, error: slotError } = await supabase
        .from('featured_slots')
        .select('business_id')
        .eq('city_id', cityResult.data.id)
        .eq('service_id', serviceResult.data.id)
        .eq('status', 'active')
        .maybeSingle();

      if (slotError || !featuredSlot?.business_id) {
        return null;
      }

      // Get the featured business
      const { data: business, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', featuredSlot.business_id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return business as Business | null;
    },
    enabled: !!(citySlug && serviceSlug),
  });
}
