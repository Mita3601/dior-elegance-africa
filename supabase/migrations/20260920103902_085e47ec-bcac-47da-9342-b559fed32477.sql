ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS payment_provider text NOT NULL DEFAULT 'moneyfusion',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_token text,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_message text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS orders_payment_token_idx ON public.orders (payment_token);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_payment_status_check
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled'));
  END IF;
END $$;