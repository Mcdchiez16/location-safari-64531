-- Add rejection_reason column to transactions table
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create support_settings table for admin-managed support information
CREATE TABLE IF NOT EXISTS public.support_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  phone text,
  additional_info text,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view support settings
CREATE POLICY "Anyone can view support settings"
ON public.support_settings
FOR SELECT
USING (true);

-- Only admins can update support settings
CREATE POLICY "Admins can update support settings"
ON public.support_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert support settings
CREATE POLICY "Admins can insert support settings"
ON public.support_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default support settings
INSERT INTO public.support_settings (email, phone, additional_info)
VALUES ('support@turapay.com', '+260-XXX-XXXX', 'Available Mon-Fri 9AM-5PM CAT')
ON CONFLICT DO NOTHING;