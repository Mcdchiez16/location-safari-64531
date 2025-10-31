-- Add unique constraint on settings.key and create receiver visibility policy for transactions
BEGIN;

-- Ensure a unique key to avoid duplicates for settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM   pg_constraint 
    WHERE  conname = 'uniq_settings_key'
  ) THEN
    ALTER TABLE public.settings
    ADD CONSTRAINT uniq_settings_key UNIQUE (key);
  END IF;
END $$;

-- Create or replace policy to allow receivers to view transactions where their phone matches receiver_phone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Receivers can view their received transactions'
      AND schemaname = 'public' AND tablename = 'transactions'
  ) THEN
    CREATE POLICY "Receivers can view their received transactions"
    ON public.transactions
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.phone_number = public.transactions.receiver_phone
      )
    );
  ELSE
    -- Replace existing policy to ensure it matches our desired condition
    DROP POLICY IF EXISTS "Receivers can view their received transactions" ON public.transactions;
    CREATE POLICY "Receivers can view their received transactions"
    ON public.transactions
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.phone_number = public.transactions.receiver_phone
      )
    );
  END IF;
END $$;

-- Insert payment_number setting if it doesn't exist
INSERT INTO public.settings (key, value, description)
VALUES ('payment_number', '+263 77 123 4567', 'Admin payment number for receiving funds')
ON CONFLICT (key) DO NOTHING;

COMMIT;