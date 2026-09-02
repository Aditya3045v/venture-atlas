-- ====================================================================
-- VENTURE ATLAS: MFA RECOVERY CODES
-- Migration: 20260901000006_mfa_recovery_codes.sql
-- ====================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS mfa_recovery_codes TEXT[] DEFAULT '{}'::TEXT[];
