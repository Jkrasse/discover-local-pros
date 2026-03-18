
CREATE TABLE public.scrape_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text NOT NULL,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  search_term text NOT NULL,
  cities text[] NOT NULL DEFAULT '{}',
  city_limit integer NOT NULL DEFAULT 20,
  status text NOT NULL DEFAULT 'processing',
  summary jsonb,
  results jsonb,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scrape_jobs" ON public.scrape_jobs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
