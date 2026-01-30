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
}

export function useBusinessReviews(businessName: string, cityName?: string, enabled = true) {
  return useQuery({
    queryKey: ['business-reviews', businessName, cityName],
    queryFn: async (): Promise<Review[]> => {
      // Build a search query with business name and city for better matching
      const query = cityName 
        ? `${businessName} ${cityName}, Sweden` 
        : `${businessName}, Sweden`;

      const { data, error } = await supabase.functions.invoke<ReviewsResponse>('fetch-reviews', {
        body: { 
          query,
          limit: 5,
          sort: 'highest_rating'
        },
      });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      return data?.reviews || [];
    },
    enabled: enabled && !!businessName,
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // Keep in cache for 7 days
  });
}
