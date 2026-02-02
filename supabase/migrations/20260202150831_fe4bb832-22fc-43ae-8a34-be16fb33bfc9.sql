-- Add column for city-specific lead notification email
ALTER TABLE public.cities 
ADD COLUMN lead_notification_email text;

-- Add comment to explain the column
COMMENT ON COLUMN public.cities.lead_notification_email IS 'Email address to send lead notifications for this city';