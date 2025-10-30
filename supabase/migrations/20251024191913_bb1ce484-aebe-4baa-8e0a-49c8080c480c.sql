-- Add KYC and payment identifier fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS payment_link_id TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 12),
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'sender' CHECK (account_type IN ('sender', 'receiver', 'both')),
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS selfie_url TEXT;

-- Update existing profiles to set account_type based on country
UPDATE public.profiles
SET account_type = CASE 
  WHEN country = 'Zimbabwe' THEN 'sender'
  WHEN country = 'Zambia' THEN 'receiver'
  ELSE 'both'
END
WHERE account_type = 'sender';

-- Create index for faster payment_link_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_payment_link_id ON public.profiles(payment_link_id);

-- Add RLS policy to allow users to look up profiles by payment_link_id
CREATE POLICY "Users can view profiles by payment link" 
ON public.profiles 
FOR SELECT 
USING (true);