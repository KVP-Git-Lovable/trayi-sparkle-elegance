-- Price requests submitted via the AI Assistant "Ask for Price" button.
-- Read access is intentionally not granted to anon/authenticated;
-- requests will be surfaced in the POS (storehaven-essentials) later.
CREATE TABLE public.price_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_handle text NOT NULL,
  product_name text NOT NULL,
  user_id uuid NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.price_requests ENABLE ROW LEVEL SECURITY;

-- The chat works for logged-out visitors too, so anonymous inserts are allowed.
CREATE POLICY "Anyone can submit price requests"
  ON public.price_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
