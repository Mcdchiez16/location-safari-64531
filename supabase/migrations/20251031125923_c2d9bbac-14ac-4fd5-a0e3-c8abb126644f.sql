-- Add sender_name to transactions so receivers can see sender names without cross-table reads
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS sender_name text;