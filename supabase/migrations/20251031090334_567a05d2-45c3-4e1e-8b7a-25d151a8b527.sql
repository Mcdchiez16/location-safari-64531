-- Generate and enforce unique payment link IDs
CREATE OR REPLACE FUNCTION public.generate_payment_link_id()
RETURNS text
LANGUAGE sql
VOLATILE
AS $$
  SELECT lower(substr(replace(gen_random_uuid()::text,'-',''),1,10));
$$;

-- Set default for new profiles
ALTER TABLE public.profiles
ALTER COLUMN payment_link_id SET DEFAULT public.generate_payment_link_id();

-- Ensure uniqueness
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uniq_profiles_payment_link_id'
  ) THEN
    CREATE UNIQUE INDEX uniq_profiles_payment_link_id ON public.profiles (payment_link_id);
  END IF;
END $$;

-- Backfill existing null values
UPDATE public.profiles
SET payment_link_id = public.generate_payment_link_id()
WHERE payment_link_id IS NULL;

-- Create storage buckets for proofs and KYC documents (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-docs', 'kyc-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for payment-proofs bucket
DROP POLICY IF EXISTS "Public can view payment proofs" ON storage.objects;
CREATE POLICY "Public can view payment proofs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Users can upload their own payment proofs" ON storage.objects;
CREATE POLICY "Users can upload their own payment proofs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own payment proofs" ON storage.objects;
CREATE POLICY "Users can update their own payment proofs"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'payment-proofs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Admin full access payment proofs" ON storage.objects;
CREATE POLICY "Admin full access payment proofs"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Policies for kyc-docs bucket
DROP POLICY IF EXISTS "Public can view kyc docs" ON storage.objects;
CREATE POLICY "Public can view kyc docs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'kyc-docs');

DROP POLICY IF EXISTS "Users can upload their own kyc docs" ON storage.objects;
CREATE POLICY "Users can upload their own kyc docs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own kyc docs" ON storage.objects;
CREATE POLICY "Users can update their own kyc docs"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'kyc-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Admin full access kyc docs" ON storage.objects;
CREATE POLICY "Admin full access kyc docs"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'kyc-docs' AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'kyc-docs' AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
