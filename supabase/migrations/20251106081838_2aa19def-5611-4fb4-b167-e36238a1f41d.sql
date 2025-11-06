-- Update handle_new_user function to use case-insensitive referral code matching
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referrer_id uuid;
  ref_code text;
  normalized_phone text;
BEGIN
  -- Extract referral code from metadata
  ref_code := NEW.raw_user_meta_data->>'referred_by';
  
  -- Look up the referrer's ID if a referral code was provided (case-insensitive)
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    SELECT id INTO referrer_id
    FROM public.profiles
    WHERE LOWER(referral_code) = LOWER(ref_code)
    LIMIT 1;
  END IF;
  
  -- Normalize phone number before storing
  normalized_phone := normalize_phone_number(COALESCE(NEW.raw_user_meta_data->>'phone_number', ''));
  
  -- Insert profile with referral information and normalized phone
  INSERT INTO public.profiles (id, full_name, phone_number, country, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    normalized_phone,
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    referrer_id
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;