-- Tokens for the custom email-verification flow (emails sent via Resend
-- from the send-verification-email edge function; consumed by verify-email).
CREATE TABLE public.email_verifications (
  token uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT now() + interval '24 hours',
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- No RLS policies on purpose: only the service-role key (edge functions)
-- reads or writes this table.
