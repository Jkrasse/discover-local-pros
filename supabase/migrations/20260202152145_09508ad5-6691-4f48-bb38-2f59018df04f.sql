-- Create table to cache business reviews
CREATE TABLE public.business_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_image text,
  rating integer NOT NULL,
  review_text text,
  review_time text,
  likes integer DEFAULT 0,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_business_reviews_business_id ON public.business_reviews(business_id);
CREATE INDEX idx_business_reviews_fetched_at ON public.business_reviews(fetched_at);

-- Enable RLS
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;

-- Reviews are publicly readable
CREATE POLICY "Business reviews are publicly readable"
ON public.business_reviews
FOR SELECT
USING (true);

-- Only admins can insert/update/delete (for edge function with service role)
CREATE POLICY "Admins can manage business reviews"
ON public.business_reviews
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));