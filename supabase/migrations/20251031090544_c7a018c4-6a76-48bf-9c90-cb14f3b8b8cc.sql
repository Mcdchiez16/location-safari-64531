-- Fix generate_payment_link_id function to set search_path
CREATE OR REPLACE FUNCTION public.generate_payment_link_id()
RETURNS text
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(substr(replace(gen_random_uuid()::text,'-',''),1,10));
$$;
