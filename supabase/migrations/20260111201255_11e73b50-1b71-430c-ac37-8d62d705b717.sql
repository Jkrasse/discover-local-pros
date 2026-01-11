-- Add customer/CRM fields to featured_slots
ALTER TABLE public.featured_slots
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add site_settings entries for site configuration (if they don't exist)
INSERT INTO public.site_settings (key, value)
VALUES 
  ('site_name', '"Hitta Flyttfirma"'),
  ('site_description', '"Jämför och hitta de bästa flyttfirmorna i Sverige"'),
  ('contact_email', '"info@example.com"'),
  ('contact_phone', '""'),
  ('primary_service_category', '"moving"')
ON CONFLICT (key) DO NOTHING;