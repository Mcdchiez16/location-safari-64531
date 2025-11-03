-- Add referral tracking columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT lower(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_earnings NUMERIC DEFAULT 0;

-- Add referral percentage setting
INSERT INTO public.settings (key, value, description)
VALUES ('referral_percentage', '5', 'Percentage of transaction amount that referrer receives')
ON CONFLICT (key) DO NOTHING;

-- Create referral_transactions table to track referral rewards
CREATE TABLE IF NOT EXISTS public.referral_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  reward_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(transaction_id)
);

-- Enable RLS on referral_transactions
ALTER TABLE public.referral_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral earnings
CREATE POLICY "Users can view their referral earnings"
ON public.referral_transactions
FOR SELECT
USING (auth.uid() = referrer_id);

-- Admins can view all referral transactions
CREATE POLICY "Admins can view all referral transactions"
ON public.referral_transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));