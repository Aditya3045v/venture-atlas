-- ====================================================================
-- VENTURE ATLAS: FIX ROLE PROTECTION TRIGGER FOR SERVICE ROLE
-- Migration: 20260901000005_fix_trigger_service_role_bypass.sql
--
-- The prevent_self_role_change trigger uses is_admin() which calls
-- auth.uid(). When auth.uid() is NULL (service role key, admin API,
-- migrations), the trigger wrongly blocks role changes.
-- Fix: allow when auth.uid() IS NULL (service role always bypasses).
-- This is correct: the service role key is only used server-side and
-- is never accessible to end users or the browser.
-- ====================================================================

CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- auth.uid() IS NULL when called by the service role key (admin API, migrations).
    -- Service role operations are always trusted.
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;

    -- For authenticated requests, only ADMINs may change roles.
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'PERMISSION_DENIED: Only administrators can assign or alter user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
