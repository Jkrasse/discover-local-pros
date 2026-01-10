-- Add is_placeholder column to featured_slots for random featured businesses
ALTER TABLE public.featured_slots 
ADD COLUMN IF NOT EXISTS is_placeholder boolean DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN public.featured_slots.is_placeholder IS 'True when this slot contains a randomly selected placeholder business, not a paying customer';