-- ========================================
-- TuraPay Cross-Border Transfer System
-- Database Setup Script
-- ========================================
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app_role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create user_roles table (CRITICAL: separate from profiles for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, role)
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;

-- Create recipients table
CREATE TABLE IF NOT EXISTS public.recipients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name text NOT NULL,
    phone_number text NOT NULL,
    country text DEFAULT 'Zambia',
    payout_method text NOT NULL CHECK (payout_method IN ('Airtel Money', 'MTN Money', 'Manual')),
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns to transactions table
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS recipient_id uuid REFERENCES public.recipients(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payout_method text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS exchange_rate numeric(10,4);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS amount_received numeric(15,2);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS proof_of_payment_url text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency text NOT NULL DEFAULT 'USD',
    to_currency text NOT NULL DEFAULT 'ZMW',
    rate numeric(10,4) NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active boolean DEFAULT true
);

-- Insert default exchange rate
INSERT INTO public.exchange_rates (from_currency, to_currency, rate, is_active)
VALUES ('USD', 'ZMW', 27.5000, true)
ON CONFLICT DO NOTHING;

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
    ('commission_percentage', '5', 'Commission percentage on transactions'),
    ('transfer_fee', '2.99', 'Flat transfer fee in USD'),
    ('admin_contact_email', 'admin@turapay.com', 'Admin contact email'),
    ('admin_contact_phone', '+260000000000', 'Admin contact phone')
ON CONFLICT (key) DO NOTHING;

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT DO NOTHING;

-- Storage policy for payment proofs
CREATE POLICY "Users can upload their own payment proofs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view payment proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-proofs');

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own recipients" ON public.recipients;
DROP POLICY IF EXISTS "Users can create their own recipients" ON public.recipients;
DROP POLICY IF EXISTS "Users can update their own recipients" ON public.recipients;
DROP POLICY IF EXISTS "Users can delete their own recipients" ON public.recipients;
DROP POLICY IF EXISTS "Admins can view all recipients" ON public.recipients;
DROP POLICY IF EXISTS "Anyone can view active exchange rates" ON public.exchange_rates;
DROP POLICY IF EXISTS "Admins can manage exchange rates" ON public.exchange_rates;
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for recipients
CREATE POLICY "Users can view their own recipients"
    ON public.recipients FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipients"
    ON public.recipients FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipients"
    ON public.recipients FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipients"
    ON public.recipients FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all recipients"
    ON public.recipients FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for exchange_rates
CREATE POLICY "Anyone can view active exchange rates"
    ON public.exchange_rates FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Admins can manage exchange rates"
    ON public.exchange_rates FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for settings
CREATE POLICY "Anyone can view settings"
    ON public.settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can update settings"
    ON public.settings FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Update transaction RLS policies for admin access
CREATE POLICY "Admins can view all transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transactions"
    ON public.transactions FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS recipients_updated_at ON public.recipients;
CREATE TRIGGER recipients_updated_at BEFORE UPDATE ON public.recipients
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS settings_updated_at ON public.settings;
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.recipients TO authenticated;
GRANT ALL ON public.exchange_rates TO authenticated;
GRANT ALL ON public.settings TO authenticated;
