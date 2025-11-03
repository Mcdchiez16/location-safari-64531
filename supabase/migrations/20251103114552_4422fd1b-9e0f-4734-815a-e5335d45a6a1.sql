-- Create RPCs to safely lookup profiles while respecting RLS via SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.find_profile_by_phone(_phone text)
RETURNS TABLE (
  id uuid,
  full_name text,
  phone_number text,
  payment_link_id text,
  verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.phone_number, p.payment_link_id, p.verified
  FROM public.profiles p
  WHERE p.phone_number = public.normalize_phone_number(_phone)
    AND (auth.uid() IS NOT NULL)
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.find_profile_by_payment_link(_link text)
RETURNS TABLE (
  id uuid,
  full_name text,
  phone_number text,
  payment_link_id text,
  verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.phone_number, p.payment_link_id, p.verified
  FROM public.profiles p
  WHERE p.payment_link_id = trim(_link)
    AND (auth.uid() IS NOT NULL)
  LIMIT 1;
$$;