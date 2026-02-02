import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  author_name: string;
  author_image?: string;
  rating: number;
  text: string;
  time: string;
  likes?: number;
}

interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  totalFound: number;
  cached?: boolean;
}

export function useBusinessReviews(
  businessId: string,
  businessName: string, 
  cityName?: string, 
  enabled = true,
  gbpId?: string | null // Google Business Profile ID for more accurate matching
) {
  return useQuery({
    queryKey: ['business-reviews', businessId],
    queryFn: async (): Promise<Review[]> => {
      // Build request body
      const body: { 
        businessId: string;
        placeId?: string; 
        query?: string; 
        limit: number; 
        sort: string;
      } = {
        businessId,
        limit: 5,
        sort: 'highest_rating'
      };

      if (gbpId) {
        // Use place_id for exact matching
        body.placeId = gbpId;
      } else {
        // Fallback to search query with business name and city
        body.query = cityName 
          ? `${businessName} ${cityName}, Sweden` 
          : `${businessName}, Sweden`;
      }

      const { data, error } = await supabase.functions.invoke<ReviewsResponse>('fetch-reviews', {
        body,
      });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      return data?.reviews || [];
    },
    enabled: enabled && !!businessId && !!(gbpId || businessName),
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours in React Query
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep in cache for 7 days
    retry: 1, // Only retry once on failure
  });
}
