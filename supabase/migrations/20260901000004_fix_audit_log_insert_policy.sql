-- ====================================================================
-- VENTURE ATLAS: AUDIT LOG INSERT POLICY FIX
-- Migration: 20260901000004_fix_audit_log_insert_policy.sql
-- VULNERABILITY: Previous policy had WITH CHECK (true) allowing anon INSERT.
-- Fix: Restrict audit_log INSERT to authenticated staff only.
-- Audit logs are written server-side via service role key anyway;
-- the PostgREST anon path must never be able to inject records.
-- ====================================================================

DROP POLICY IF EXISTS "Audit logs can be created" ON audit_logs;

-- Only authenticated staff (WRITER/EDITOR/ADMIN) can insert via PostgREST.
-- The application uses the service role key server-side which bypasses RLS,
-- but this policy closes the anon/reader injection vector entirely.
CREATE POLICY "Only authenticated staff can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND public.is_staff()
);
