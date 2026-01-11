-- Allow admins to manage services
CREATE POLICY "Admins can insert services" 
ON public.services 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update services" 
ON public.services 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete services" 
ON public.services 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage cities
CREATE POLICY "Admins can insert cities" 
ON public.cities 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update cities" 
ON public.cities 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete cities" 
ON public.cities 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage businesses
CREATE POLICY "Admins can insert businesses" 
ON public.businesses 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update businesses" 
ON public.businesses 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete businesses" 
ON public.businesses 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage featured_slots
CREATE POLICY "Admins can insert featured_slots" 
ON public.featured_slots 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update featured_slots" 
ON public.featured_slots 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete featured_slots" 
ON public.featured_slots 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage business_service_coverage
CREATE POLICY "Admins can insert business_service_coverage" 
ON public.business_service_coverage 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update business_service_coverage" 
ON public.business_service_coverage 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete business_service_coverage" 
ON public.business_service_coverage 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage site_settings
CREATE POLICY "Admins can insert site_settings" 
ON public.site_settings 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site_settings" 
ON public.site_settings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site_settings" 
ON public.site_settings 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to read leads
CREATE POLICY "Admins can read leads" 
ON public.leads 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update leads" 
ON public.leads 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete leads" 
ON public.leads 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));