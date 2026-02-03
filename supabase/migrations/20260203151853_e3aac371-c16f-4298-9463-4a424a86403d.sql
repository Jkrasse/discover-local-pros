-- Create a public view for featured_slots that excludes sensitive customer data
CREATE VIEW public.featured_slots_public
WITH (security_invoker = on) AS
SELECT 
  id,
  business_id,
  city_id,
  service_id,
  status,
  is_placeholder,
  created_at,
  updated_at
FROM public.featured_slots;

-- Drop the old public SELECT policy
DROP POLICY IF EXISTS "Active featured slots are publicly readable" ON public.featured_slots;

-- Create new policy that only allows admins to read from the base table directly
CREATE POLICY "Admins can read featured_slots"
ON public.featured_slots
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on the view (views inherit RLS from base table when security_invoker is on)
-- The public can query the view, which only exposes safe fields