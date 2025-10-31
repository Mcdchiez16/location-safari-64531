-- Add transfer fee setting
INSERT INTO public.settings (key, value, description)
VALUES ('transfer_fee_percentage', '2', 'Transfer fee as a percentage of the transaction amount')
ON CONFLICT (key) DO NOTHING;

-- Add columns for sender details and TID to transactions
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS sender_number text,
ADD COLUMN IF NOT EXISTS transaction_id text,
ADD COLUMN IF NOT EXISTS tid text;

-- Create function to generate TID
CREATE OR REPLACE FUNCTION generate_tid()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  random_string text;
BEGIN
  -- Generate a random string like "TID" + 6 uppercase letters/numbers
  random_string := 'TID' || upper(substr(md5(random()::text), 1, 6));
  RETURN random_string;
END;
$$;