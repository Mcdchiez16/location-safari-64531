-- Create trigger to populate profiles and referral linkage on user signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- RLS: Allow users to view profiles they referred (needed for referral counts and nested joins)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can view their referrals'
  ) THEN
    CREATE POLICY "Users can view their referrals"
    ON public.profiles
    FOR SELECT
    USING (referred_by = auth.uid());
  END IF;
END $$;

-- Optional: helpful index for counts and lookups by referrer
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles (referred_by);