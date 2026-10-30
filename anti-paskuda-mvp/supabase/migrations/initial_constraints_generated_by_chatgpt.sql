-- Financial Goblin: FG-04 constraints for the schema in your screenshot.
-- Run the ENTIRE file in Supabase SQL Editor as the project database owner.
-- This is a migration for EXISTING tables, not a fresh database setup.
-- No rows/tables are deleted. A failure rolls back this entire transaction.
-- Existing financial values are never guessed, rounded, or repaired.
-- Technical null timestamps/is_archived are backfilled as documented below.
-- If data is invalid, fix the identified test rows and run the entire file again.
-- Save this file in supabase/migrations/ and record it as applied if run manually.
-- Do not blindly run it through a second migration runner after manual execution.
-- RLS is enabled; owner access policies must still be implemented in FG-05.
-- Currency/timezone selection: RUB or GEL; Europe/Moscow or Asia/Tbilisi.
-- Money cap: 999,999,999.99 per field (large enough for RUB debts).
-- Column assumption: debts.minimum_monthly_payment (truncated in screenshot).

BEGIN;
SET LOCAL lock_timeout = '5s';

-- The onboarding completion date is optional until first setup completes.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tracking_started_on date;

-- 2. Check the expected column names/types before making further changes.
DO $migration$
DECLARE r record; actual_type text;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('profiles', 'id', 'uuid'),
    ('profiles', 'display_name', 'text'),
    ('profiles', 'avatar_url', 'text'),
    ('profiles', 'currency', 'text'),
    ('profiles', 'timezone', 'text'),
    ('profiles', 'created_at', 'timestamptz'),
    ('profiles', 'tracking_started_on', 'date'),
    ('monthly_plans', 'id', 'uuid'),
    ('monthly_plans', 'owner_id', 'uuid'),
    ('monthly_plans', 'month', 'date'),
    ('monthly_plans', 'income', 'numeric'),
    ('monthly_plans', 'essential_reserve', 'numeric'),
    ('monthly_plans', 'debt_payment_reserve', 'numeric'),
    ('monthly_plans', 'planned_savings', 'numeric'),
    ('monthly_plans', 'created_at', 'timestamptz'),
    ('monthly_plans', 'updated_at', 'timestamptz'),
    ('expenses', 'id', 'uuid'),
    ('expenses', 'owner_id', 'uuid'),
    ('expenses', 'plan_id', 'uuid'),
    ('expenses', 'amount', 'numeric'),
    ('expenses', 'category', 'text'),
    ('expenses', 'description', 'text'),
    ('expenses', 'expense_date', 'date'),
    ('expenses', 'created_at', 'timestamptz'),
    ('expenses', 'updated_at', 'timestamptz'),
    ('debts', 'id', 'uuid'),
    ('debts', 'owner_id', 'uuid'),
    ('debts', 'title', 'text'),
    ('debts', 'current_balance', 'numeric'),
    ('debts', 'balance_as_of', 'date'),
    ('debts', 'minimum_monthly_payment', 'numeric'),
    ('debts', 'next_payment_due_on', 'date'),
    ('debts', 'notes', 'text'),
    ('debts', 'is_archived', 'bool'),
    ('debts', 'created_at', 'timestamptz'),
    ('debts', 'updated_at', 'timestamptz')
  ) AS expected(table_name, column_name, expected_type)
  LOOP
    SELECT c.udt_name INTO actual_type FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name=r.table_name AND c.column_name=r.column_name;
    IF actual_type IS DISTINCT FROM r.expected_type THEN
      RAISE EXCEPTION 'Expected public.%.% to have type %, found %. Check the column spelling/type before running again.',
        r.table_name, r.column_name, r.expected_type, coalesce(actual_type, 'MISSING');
    END IF;
  END LOOP;
END;
$migration$;

-- Stop only our own triggers while applying/reapplying this migration.
DROP TRIGGER IF EXISTS fg04_guard_profile ON public.profiles;
DROP TRIGGER IF EXISTS fg04_guard_finance ON public.monthly_plans;
DROP TRIGGER IF EXISTS fg04_guard_finance ON public.expenses;
DROP TRIGGER IF EXISTS fg04_guard_finance ON public.debts;

-- 3. Required fields, defaults, and exact money storage.
-- Removing a numeric precision/scale modifier preserves existing values and
-- ensures future extra decimal places are CHECKed, rather than rounded first.
ALTER TABLE public.monthly_plans ALTER COLUMN income TYPE numeric;
ALTER TABLE public.monthly_plans ALTER COLUMN essential_reserve TYPE numeric;
ALTER TABLE public.monthly_plans ALTER COLUMN debt_payment_reserve TYPE numeric;
ALTER TABLE public.monthly_plans ALTER COLUMN planned_savings TYPE numeric;
ALTER TABLE public.expenses ALTER COLUMN amount TYPE numeric;
ALTER TABLE public.debts ALTER COLUMN current_balance TYPE numeric;
ALTER TABLE public.debts ALTER COLUMN minimum_monthly_payment TYPE numeric;
UPDATE public.profiles SET created_at=now() WHERE created_at IS NULL;
ALTER TABLE public.profiles ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT auth.uid();
ALTER TABLE public.profiles
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN currency SET NOT NULL,
  ALTER COLUMN timezone SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL;

UPDATE public.monthly_plans SET created_at=now() WHERE created_at IS NULL;
ALTER TABLE public.monthly_plans ALTER COLUMN created_at SET DEFAULT now();
UPDATE public.monthly_plans SET updated_at=created_at WHERE updated_at IS NULL;
ALTER TABLE public.monthly_plans ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.monthly_plans ALTER COLUMN id SET DEFAULT gen_random_uuid(), ALTER COLUMN owner_id SET DEFAULT auth.uid();
ALTER TABLE public.monthly_plans
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN owner_id SET NOT NULL,
  ALTER COLUMN month SET NOT NULL,
  ALTER COLUMN income SET NOT NULL,
  ALTER COLUMN essential_reserve SET NOT NULL,
  ALTER COLUMN debt_payment_reserve SET NOT NULL,
  ALTER COLUMN planned_savings SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

UPDATE public.expenses SET created_at=now() WHERE created_at IS NULL;
ALTER TABLE public.expenses ALTER COLUMN created_at SET DEFAULT now();
UPDATE public.expenses SET updated_at=created_at WHERE updated_at IS NULL;
ALTER TABLE public.expenses ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.expenses ALTER COLUMN id SET DEFAULT gen_random_uuid(), ALTER COLUMN owner_id SET DEFAULT auth.uid();
ALTER TABLE public.expenses
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN owner_id SET NOT NULL,
  ALTER COLUMN plan_id SET NOT NULL,
  ALTER COLUMN amount SET NOT NULL,
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN expense_date SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

UPDATE public.debts SET created_at=now() WHERE created_at IS NULL;
ALTER TABLE public.debts ALTER COLUMN created_at SET DEFAULT now();
UPDATE public.debts SET updated_at=created_at WHERE updated_at IS NULL;
ALTER TABLE public.debts ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.debts ALTER COLUMN id SET DEFAULT gen_random_uuid(), ALTER COLUMN owner_id SET DEFAULT auth.uid();
ALTER TABLE public.debts
  ALTER COLUMN id SET NOT NULL,
  ALTER COLUMN owner_id SET NOT NULL,
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN current_balance SET NOT NULL,
  ALTER COLUMN balance_as_of SET NOT NULL,
  ALTER COLUMN minimum_monthly_payment SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

UPDATE public.debts SET is_archived=false WHERE is_archived IS NULL;
ALTER TABLE public.debts ALTER COLUMN is_archived SET DEFAULT false, ALTER COLUMN is_archived SET NOT NULL;
-- User must select these values; no accidental GEL/Tbilisi defaults.
ALTER TABLE public.profiles ALTER COLUMN currency DROP DEFAULT, ALTER COLUMN timezone DROP DEFAULT;

-- 4. Named constraints. Existing constraints are retained.
-- Our constraints are added only when their name is absent, making reruns safe.
DO $migration$
DECLARE r record;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('profiles', 'fg04_profile_auth_fk', 'FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE'),
    ('profiles', 'fg04_profile_currency', 'CHECK (currency IN (''RUB'', ''GEL''))'),
    ('profiles', 'fg04_profile_timezone', 'CHECK (timezone IN (''Europe/Moscow'', ''Asia/Tbilisi''))'),
    ('profiles', 'fg04_profile_name', 'CHECK (display_name IS NULL OR char_length(btrim(display_name)) BETWEEN 1 AND 80)'),
    ('profiles', 'fg04_profile_avatar_length', 'CHECK (avatar_url IS NULL OR char_length(avatar_url) <= 2048)'),
    ('monthly_plans', 'fg04_monthly_plans_owner_fk', 'FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE'),
    ('expenses', 'fg04_expenses_owner_fk', 'FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE'),
    ('debts', 'fg04_debts_owner_fk', 'FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE'),
    ('monthly_plans', 'monthly_plans_owner_month_unique', 'UNIQUE (owner_id, month)'),
    ('monthly_plans', 'fg04_plan_id_owner_unique', 'UNIQUE (id, owner_id)'),
    ('monthly_plans', 'fg04_plan_month_first_day', 'CHECK (isfinite(month) AND EXTRACT(DAY FROM month)=1)'),
    ('monthly_plans', 'fg04_monthly_plans_income', 'CHECK (income >= 0 AND income <= 999999999.99 AND scale(income) <= 2)'),
    ('monthly_plans', 'fg04_monthly_plans_essential_reserve', 'CHECK (essential_reserve >= 0 AND essential_reserve <= 999999999.99 AND scale(essential_reserve) <= 2)'),
    ('monthly_plans', 'fg04_monthly_plans_debt_payment_reserve', 'CHECK (debt_payment_reserve >= 0 AND debt_payment_reserve <= 999999999.99 AND scale(debt_payment_reserve) <= 2)'),
    ('monthly_plans', 'fg04_monthly_plans_planned_savings', 'CHECK (planned_savings >= 0 AND planned_savings <= 999999999.99 AND scale(planned_savings) <= 2)'),
    ('expenses', 'fg04_expenses_amount', 'CHECK (amount > 0 AND amount <= 999999999.99 AND scale(amount) <= 2)'),
    ('debts', 'fg04_debts_current_balance', 'CHECK (current_balance >= 0 AND current_balance <= 999999999.99 AND scale(current_balance) <= 2)'),
    ('debts', 'fg04_debts_minimum_monthly_payment', 'CHECK (minimum_monthly_payment >= 0 AND minimum_monthly_payment <= 999999999.99 AND scale(minimum_monthly_payment) <= 2)'),
    ('expenses', 'fg04_expense_owner_plan_fk', 'FOREIGN KEY (plan_id, owner_id) REFERENCES public.monthly_plans(id, owner_id) ON DELETE NO ACTION'),
    ('expenses', 'fg04_expense_category', 'CHECK (category IN (''food'',''restaurants'',''shopping'',''transport'',''entertainment'',''other''))'),
    ('expenses', 'fg04_expense_description', 'CHECK (description IS NULL OR char_length(description) <= 140)'),
    ('expenses', 'fg04_expense_finite_date', 'CHECK (isfinite(expense_date))'),
    ('debts', 'fg04_debt_title', 'CHECK (char_length(btrim(title)) BETWEEN 1 AND 100)'),
    ('debts', 'fg04_debt_notes', 'CHECK (notes IS NULL OR char_length(notes) <= 500)'),
    ('debts', 'fg04_debt_balance_date', 'CHECK (isfinite(balance_as_of))'),
    ('debts', 'fg04_debt_due_date', 'CHECK (next_payment_due_on IS NULL OR isfinite(next_payment_due_on))'),
    ('profiles', 'fg04_profile_tracking_date', 'CHECK (tracking_started_on IS NULL OR isfinite(tracking_started_on))')
  ) AS rules(table_name, constraint_name, definition)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_constraint c
                   WHERE c.conrelid=to_regclass('public.' || r.table_name) AND c.conname=r.constraint_name) THEN
      EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I %s', r.table_name, r.constraint_name, r.definition);
    END IF;
  END LOOP;
END;
$migration$;

-- 5. Validate existing cross-table/date rules before installing write guards.
DO $migration$
DECLARE bad_id uuid;
BEGIN
  SELECT e.id INTO bad_id FROM public.expenses e
  JOIN public.monthly_plans m ON m.id=e.plan_id AND m.owner_id=e.owner_id
  JOIN public.profiles p ON p.id=e.owner_id
  WHERE e.expense_date < m.month
     OR e.expense_date >= (m.month + interval '1 month')::date
     OR e.expense_date > (now() AT TIME ZONE p.timezone)::date LIMIT 1;
  IF FOUND THEN RAISE EXCEPTION 'Expense % has a future date or does not match its plan month. Correct the test row first.', bad_id; END IF;

  SELECT d.id INTO bad_id FROM public.debts d JOIN public.profiles p ON p.id=d.owner_id
  WHERE d.balance_as_of > (now() AT TIME ZONE p.timezone)::date LIMIT 1;
  IF FOUND THEN RAISE EXCEPTION 'Debt % has a future balance_as_of date. Correct it first.', bad_id; END IF;

  SELECT p.id INTO bad_id FROM public.profiles p
  WHERE p.tracking_started_on > (now() AT TIME ZONE p.timezone)::date LIMIT 1;
  IF FOUND THEN RAISE EXCEPTION 'Profile % has a future tracking_started_on date. Correct it first.', bad_id; END IF;
END;
$migration$;

-- 6. Database-side guards. SECURITY INVOKER preserves caller/RLS permissions.
-- The profile row lock serializes finance writes and setting changes per owner.
CREATE OR REPLACE FUNCTION public.fg04_guard_finance()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $function$
DECLARE owner_timezone text; today date; target_month date;
BEGIN
  IF TG_OP='UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
      RAISE EXCEPTION 'Record id and owner_id cannot be changed.' USING ERRCODE='23514';
    END IF;
    NEW.created_at := OLD.created_at;
  ELSE
    NEW.created_at := now();
  END IF;
  NEW.updated_at := now();

  SELECT p.timezone INTO owner_timezone FROM public.profiles p
  WHERE p.id=NEW.owner_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Owner profile does not exist or is not accessible.' USING ERRCODE='23503'; END IF;
  today := (now() AT TIME ZONE owner_timezone)::date;

  IF TG_TABLE_NAME='monthly_plans' THEN
    IF TG_OP='UPDATE' THEN
      IF NEW.month IS DISTINCT FROM OLD.month THEN
        RAISE EXCEPTION 'A confirmed plan cannot be moved to another month.' USING ERRCODE='23514';
      END IF;
      IF OLD.month <> date_trunc('month', today::timestamp)::date THEN
        RAISE EXCEPTION 'Historical monthly plans are read-only.' USING ERRCODE='23514';
      END IF;
    ELSE
      IF NEW.month <> date_trunc('month', today::timestamp)::date THEN
        RAISE EXCEPTION 'Create a confirmed plan for the current month in the profile timezone.' USING ERRCODE='23514';
      END IF;
    END IF;

  ELSIF TG_TABLE_NAME='expenses' THEN
    SELECT m.month INTO target_month FROM public.monthly_plans m
    WHERE m.id=NEW.plan_id AND m.owner_id=NEW.owner_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Plan does not exist for this owner or is not accessible.' USING ERRCODE='23503'; END IF;
    IF NEW.expense_date < target_month OR NEW.expense_date >= (target_month + interval '1 month')::date THEN
      RAISE EXCEPTION 'Expense date must fall within the referenced plan month.' USING ERRCODE='23514';
    END IF;
    IF NEW.expense_date > today THEN
      RAISE EXCEPTION 'Expense date cannot be in the future in the profile timezone.' USING ERRCODE='23514';
    END IF;

  ELSIF TG_TABLE_NAME='debts' THEN
    IF NEW.balance_as_of > today THEN
      RAISE EXCEPTION 'Debt balance_as_of cannot be in the future.' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fg04_guard_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $function$
BEGIN
  IF TG_OP='UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Profile id cannot be changed.' USING ERRCODE='23514';
    END IF;
    NEW.created_at := OLD.created_at;
    IF NEW.currency IS DISTINCT FROM OLD.currency OR NEW.timezone IS DISTINCT FROM OLD.timezone THEN
      IF EXISTS (SELECT 1 FROM public.monthly_plans m WHERE m.owner_id=OLD.id)
         OR EXISTS (SELECT 1 FROM public.expenses e WHERE e.owner_id=OLD.id)
         OR EXISTS (SELECT 1 FROM public.debts d WHERE d.owner_id=OLD.id) THEN
        RAISE EXCEPTION 'Currency/timezone are locked once financial records exist; existing amounts must not be relabelled.' USING ERRCODE='23514';
      END IF;
    END IF;
  ELSE
    NEW.created_at := now();
  END IF;
  IF NEW.tracking_started_on IS NOT NULL AND NEW.timezone IN ('Europe/Moscow','Asia/Tbilisi') THEN
    IF NEW.tracking_started_on > (now() AT TIME ZONE NEW.timezone)::date THEN
      RAISE EXCEPTION 'Tracking start cannot be in the future.' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER fg04_guard_profile BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.fg04_guard_profile();
CREATE TRIGGER fg04_guard_finance BEFORE INSERT OR UPDATE ON public.monthly_plans
FOR EACH ROW EXECUTE FUNCTION public.fg04_guard_finance();
CREATE TRIGGER fg04_guard_finance BEFORE INSERT OR UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.fg04_guard_finance();
CREATE TRIGGER fg04_guard_finance BEFORE INSERT OR UPDATE ON public.debts
FOR EACH ROW EXECUTE FUNCTION public.fg04_guard_finance();

-- Trigger functions are not a client RPC API. This does not prevent attached
-- triggers executing; their invoker still needs the normal table privileges.
REVOKE ALL ON FUNCTION public.fg04_guard_profile() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fg04_guard_finance() FROM PUBLIC;

-- 7. Query/FK indexes and RLS enablement (no permissive policies added).
CREATE INDEX IF NOT EXISTS fg04_expenses_owner_date_idx ON public.expenses(owner_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS fg04_expenses_plan_owner_idx ON public.expenses(plan_id, owner_id);
CREATE INDEX IF NOT EXISTS fg04_debts_owner_idx ON public.debts(owner_id);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

COMMIT;

-- AFTER SUCCESS:
-- 1. Regenerate database.types.ts (tracking_started_on and updated_at changed).
-- 2. Keep this migration in Git. Types cannot recreate a database.
-- 3. Implement FG-05 RLS policies before using the app with real finance data.
--    Guard functions need own-profile SELECT/UPDATE and own-plan SELECT rights.
-- 4. Plan creation is current-month only; historical plans remain readable,
--    while historical expenses can still be corrected within saved plan months.
-- 5. This is manual debt balance tracking, not a payment ledger. Debt changes
--    do not auto-change monthly debt_payment_reserve. Confirm that snapshot in UI.
-- 6. Defaults do not create a profile/plan automatically; onboarding must do so.
-- 7. Existing unrelated policies, foreign keys and triggers are not removed.

