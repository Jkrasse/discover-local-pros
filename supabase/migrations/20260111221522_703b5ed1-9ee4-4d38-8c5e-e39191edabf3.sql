-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Service role can insert pages" ON public.pages;
DROP POLICY IF EXISTS "Service role can update pages" ON public.pages;

-- Add admin-only policies for pages table
CREATE POLICY "Admins can insert pages"
ON public.pages
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update pages"
ON public.pages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));