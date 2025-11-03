-- Update the handle_new_user function to process referral codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referrer_id uuid;
  ref_code text;
BEGIN
  -- Extract referral code from metadata
  ref_code := NEW.raw_user_meta_data->>'referred_by';
  
  -- Look up the referrer's ID if a referral code was provided
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    SELECT id INTO referrer_id
    FROM public.profiles
    WHERE referral_code = ref_code
    LIMIT 1;
  END IF;
  
  -- Insert profile with referral information
  INSERT INTO public.profiles (id, full_name, phone_number, country, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    referrer_id
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;