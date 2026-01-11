-- Add INSERT policy for pages table (allow service role to insert)
CREATE POLICY "Service role can insert pages"
ON public.pages
FOR INSERT
WITH CHECK (true);

-- Add UPDATE policy for pages table (allow service role to update)
CREATE POLICY "Service role can update pages"
ON public.pages
FOR UPDATE
USING (true);

-- Add DELETE policy for pages table (allow admins to delete)
CREATE POLICY "Admins can delete pages"
ON public.pages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));