-- Add payment proof fields to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_payment_proof_url TEXT;

-- Add comment to clarify status values
COMMENT ON COLUMN public.transactions.status IS 'pending, paid (sender view), deposited (receiver view), failed';

-- Create function to normalize phone numbers
CREATE OR REPLACE FUNCTION public.normalize_phone_number(phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Remove all non-digit characters except +
  phone := regexp_replace(phone, '[^0-9+]', '', 'g');
  
  -- If it starts with 0, assume it's Zambian and add +260
  IF phone LIKE '0%' THEN
    phone := '+260' || substring(phone from 2);
  END IF;
  
  -- If it doesn't start with +, add + 
  IF NOT phone LIKE '+%' THEN
    phone := '+' || phone;
  END IF;
  
  RETURN phone;
END;
$$;