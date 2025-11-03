-- Allow admins to create referral earnings records
CREATE POLICY "Admins can insert referral transactions"
ON public.referral_transactions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- (Optional) Allow admins to update referral transactions if needed in future
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'referral_transactions' 
      AND policyname = 'Admins can update referral transactions'
  ) THEN
    CREATE POLICY "Admins can update referral transactions"
    ON public.referral_transactions
    FOR UPDATE
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;