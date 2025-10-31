-- Fix search path for generate_tid function
CREATE OR REPLACE FUNCTION generate_tid()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  random_string text;
BEGIN
  -- Generate a random string like "TID" + 6 uppercase letters/numbers
  random_string := 'TID' || upper(substr(md5(random()::text), 1, 6));
  RETURN random_string;
END;
$$;