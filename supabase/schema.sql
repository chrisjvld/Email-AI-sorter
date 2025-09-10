-- Schema for accounts, emails, leads with RLS

-- Enum for email categories
DO $$ BEGIN
  CREATE TYPE email_category AS ENUM ('lead','client','admin','spam');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- accounts: connected providers (google)
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL CHECK (provider IN ('google','microsoft')),
  email_address text,
  access_token text,
  refresh_token text,
  scope text,
  token_expiry timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

-- emails
CREATE TABLE IF NOT EXISTS public.emails (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  gmail_id text UNIQUE,
  thread_id text,
  subject text,
  sender text,
  recipient_to text,
  recipient_cc text,
  snippet text,
  body_text text,
  body_html text,
  received_at timestamptz,
  category email_category,
  processed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- leads (extracted from emails)
CREATE TABLE IF NOT EXISTS public.leads (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  email_id bigint NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  name text,
  email text,
  company text,
  budget text,
  meeting_link text,
  confidence numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_emails_user_received ON public.emails(user_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_user_created ON public.leads(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policies: only owner (by user_id) can access their rows
DO $$ BEGIN
  CREATE POLICY accounts_select ON public.accounts FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY accounts_modify ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY accounts_update ON public.accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY emails_select ON public.emails FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY emails_insert ON public.emails FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY emails_update ON public.emails FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY leads_select ON public.leads FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY leads_insert ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY leads_update ON public.leads FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;


