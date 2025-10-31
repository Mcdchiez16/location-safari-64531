-- Fix search_path for normalize_phone_number function
DROP FUNCTION IF EXISTS public.normalize_phone_number(TEXT);

CREATE OR REPLACE FUNCTION public.normalize_phone_number(phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
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