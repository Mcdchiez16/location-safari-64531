-- Add max transfer limit setting
INSERT INTO public.settings (key, value, description)
VALUES ('max_transfer_limit', '10000', 'Maximum amount (USD) that any user can transfer in a single transaction')
ON CONFLICT (key) DO NOTHING;