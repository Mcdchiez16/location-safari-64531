-- Add payment_recipient_name setting
INSERT INTO settings (key, value, description)
VALUES (
  'payment_recipient_name',
  'TuraPay',
  'Name of the payment recipient shown to senders'
)
ON CONFLICT (key) DO NOTHING;