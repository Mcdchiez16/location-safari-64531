-- Add settings for card payments and referral program
INSERT INTO public.settings (key, value, description)
VALUES 
  ('card_payments_enabled', 'true', 'Enable or disable card payment option'),
  ('referral_program_enabled', 'true', 'Enable or disable referral program')
ON CONFLICT (key) DO NOTHING;