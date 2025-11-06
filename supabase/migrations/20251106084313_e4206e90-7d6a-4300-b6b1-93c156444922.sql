-- Add referral program settings
INSERT INTO public.settings (key, value, description)
VALUES 
  ('referral_enabled', 'true', 'Enable or disable the referral program'),
  ('referral_payout_threshold', '50', 'Minimum referral earnings amount (USD) before admin is notified for payout')
ON CONFLICT (key) DO NOTHING;