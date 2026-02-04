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

/**
 * Fetches cached reviews from the database.
 * Reviews are imported during the scraping process, not fetched on page load.
 */
export function useBusinessReviews(
  businessId: string,
  _businessName?: string, // Kept for backwards compatibility, not used
  _cityName?: string, // Kept for backwards compatibility, not used
  enabled = true,
  _gbpId?: string | null // Kept for backwards compatibility, not used
) {
  return useQuery({
    queryKey: ['business-reviews', businessId],
    queryFn: async (): Promise<Review[]> => {
      // Read directly from cached reviews in database
      const { data: cachedReviews, error } = await supabase
        .from('business_reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('rating', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching cached reviews:', error);
        throw error;
      }

      if (!cachedReviews || cachedReviews.length === 0) {
        return [];
      }

      // Transform to Review format
      return cachedReviews.map((r) => ({
        author_name: r.author_name,
        author_image: r.author_image || undefined,
        rating: r.rating,
        text: r.review_text || '',
        time: r.review_time || '',
        likes: r.likes || 0,
      }));
    },
    enabled: enabled && !!businessId,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour in React Query
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 1 day
  });
}
