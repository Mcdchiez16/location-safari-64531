-- Update the handle_new_user function to normalize phone numbers on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_id uuid;
  ref_code text;
  normalized_phone text;
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
$$;

-- Normalize existing phone numbers in the database
UPDATE public.profiles
SET phone_number = normalize_phone_number(phone_number)
WHERE phone_number IS NOT NULL 
  AND phone_number != ''
  AND phone_number NOT LIKE '+%';