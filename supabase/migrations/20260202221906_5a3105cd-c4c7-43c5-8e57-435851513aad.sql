-- Create table for service-specific content (intro, tips, FAQs per service/city)
CREATE TABLE public.service_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  intro_text TEXT,
  tips JSONB DEFAULT '[]'::jsonb,
  checklist JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  feature_cards JSONB DEFAULT '[]'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_service_city UNIQUE(service_id, city_id)
);

-- Enable RLS
ALTER TABLE public.service_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access (content is for SEO landing pages)
CREATE POLICY "Service content is publicly readable" 
ON public.service_content 
FOR SELECT 
USING (true);

-- Only admins can manage content
CREATE POLICY "Admins can manage service content" 
ON public.service_content 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_service_content_updated_at
BEFORE UPDATE ON public.service_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient lookups
CREATE INDEX idx_service_content_lookup ON public.service_content(service_id, city_id);

-- Also add a content column to services table for service-level defaults
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS intro_template TEXT,
ADD COLUMN IF NOT EXISTS tips_template JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS checklist_template JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS faqs_template JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS feature_cards_template JSONB DEFAULT '[]'::jsonb;