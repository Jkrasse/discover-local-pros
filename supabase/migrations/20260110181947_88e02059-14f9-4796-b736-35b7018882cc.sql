-- Enum för tjänstekategorier
CREATE TYPE public.service_category AS ENUM ('moving', 'cleaning', 'dental', 'other');

-- Enum för featured slot status
CREATE TYPE public.featured_status AS ENUM ('active', 'pending', 'expired');

-- Städer
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  region TEXT,
  population INTEGER,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tjänster (nischer)
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category service_category NOT NULL DEFAULT 'other',
  parent_service_id UUID REFERENCES public.services(id),
  icon TEXT,
  description TEXT,
  seo_title_template TEXT,
  seo_description_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Företag
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gbp_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  rating DECIMAL(2, 1),
  review_count INTEGER DEFAULT 0,
  price_level INTEGER,
  categories TEXT[],
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  opening_hours JSONB,
  images TEXT[],
  description TEXT,
  verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(slug, city_id)
);

-- Koppling: Vilka tjänster ett företag erbjuder i vilka städer
CREATE TABLE public.business_service_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(business_id, service_id, city_id)
);

-- Rekommenderade platser (säljs som abonnemang)
CREATE TABLE public.featured_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  status featured_status NOT NULL DEFAULT 'pending',
  start_date DATE,
  end_date DATE,
  plan TEXT,
  price_monthly INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(city_id, service_id)
);

-- Leads (formulärinskick)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  move_date DATE,
  from_area TEXT,
  to_area TEXT,
  housing_type TEXT,
  message TEXT,
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SEO-sidor (override för specifika routes)
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT NOT NULL UNIQUE,
  title TEXT,
  meta_description TEXT,
  h1 TEXT,
  content TEXT,
  faq JSONB,
  og_image TEXT,
  noindex BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Site settings
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_service_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies for public-facing data
CREATE POLICY "Cities are publicly readable" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Services are publicly readable" ON public.services FOR SELECT USING (true);
CREATE POLICY "Active businesses are publicly readable" ON public.businesses FOR SELECT USING (is_active = true);
CREATE POLICY "Business service coverage is publicly readable" ON public.business_service_coverage FOR SELECT USING (true);
CREATE POLICY "Active featured slots are publicly readable" ON public.featured_slots FOR SELECT USING (status = 'active');
CREATE POLICY "Pages are publicly readable" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Site settings are publicly readable" ON public.site_settings FOR SELECT USING (true);

-- Leads can be inserted by anyone (public form)
CREATE POLICY "Anyone can submit leads" ON public.leads FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_businesses_city ON public.businesses(city_id);
CREATE INDEX idx_businesses_rating ON public.businesses(rating DESC);
CREATE INDEX idx_businesses_slug ON public.businesses(slug);
CREATE INDEX idx_business_service_coverage_service ON public.business_service_coverage(service_id);
CREATE INDEX idx_business_service_coverage_city ON public.business_service_coverage(city_id);
CREATE INDEX idx_featured_slots_lookup ON public.featured_slots(city_id, service_id);
CREATE INDEX idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX idx_cities_slug ON public.cities(slug);
CREATE INDEX idx_services_slug ON public.services(slug);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_featured_slots_updated_at BEFORE UPDATE ON public.featured_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();