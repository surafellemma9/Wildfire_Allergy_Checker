-- Migration: Multi-tenant architecture for Wildfire Allergy Checker
-- Creates: tenants, activation_codes, devices, packs tables with RLS
-- Idempotent: safe to run multiple times (uses IF NOT EXISTS + DROP ... IF EXISTS)

-- ============================================================================
-- EXTENSIONS (gen_random_uuid)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- TENANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_name text DEFAULT 'LEYE',
  concept_name text NOT NULL,
  location_name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Index for status lookups
CREATE INDEX IF NOT EXISTS idx_tenants_status
  ON public.tenants(status);

-- ============================================================================
-- ACTIVATION CODES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 days'),
  max_activations int NOT NULL DEFAULT 10,
  activations_used int NOT NULL DEFAULT 0 CHECK (activations_used >= 0),
  is_active boolean NOT NULL DEFAULT true
);

-- Indexes for activation lookups
CREATE INDEX IF NOT EXISTS idx_activation_codes_code
  ON public.activation_codes(code);

CREATE INDEX IF NOT EXISTS idx_activation_codes_tenant
  ON public.activation_codes(tenant_id);

CREATE INDEX IF NOT EXISTS idx_activation_codes_active
  ON public.activation_codes(is_active, expires_at);

-- ============================================================================
-- DEVICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  device_fingerprint text NOT NULL,
  device_token text UNIQUE NOT NULL,
  is_revoked boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  -- One device fingerprint per tenant
  UNIQUE(tenant_id, device_fingerprint)
);

-- Indexes for device lookups
CREATE INDEX IF NOT EXISTS idx_devices_token
  ON public.devices(device_token);

CREATE INDEX IF NOT EXISTS idx_devices_tenant
  ON public.devices(tenant_id);

CREATE INDEX IF NOT EXISTS idx_devices_fingerprint
  ON public.devices(device_fingerprint);

-- ============================================================================
-- PACKS TABLE (versioned tenant data packs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  version int NOT NULL CHECK (version > 0),
  pack_path text NOT NULL,  -- storage path: tenant-packs/{tenantId}/v{version}.json
  checksum text NOT NULL,   -- SHA-256 hash
  published_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  -- One version per tenant
  UNIQUE(tenant_id, version)
);

-- Indexes for pack lookups
CREATE INDEX IF NOT EXISTS idx_packs_tenant_version
  ON public.packs(tenant_id, version DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;

-- No public access - all access via Edge Functions with service role
-- These policies ensure even authenticated users can't access directly

-- Drop existing policies if rerunning migration
DROP POLICY IF EXISTS "tenants_service_role_only" ON public.tenants;
DROP POLICY IF EXISTS "activation_codes_service_role_only" ON public.activation_codes;
DROP POLICY IF EXISTS "devices_service_role_only" ON public.devices;
DROP POLICY IF EXISTS "packs_service_role_only" ON public.packs;

-- Recreate policies
CREATE POLICY "tenants_service_role_only" ON public.tenants
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "activation_codes_service_role_only" ON public.activation_codes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "devices_service_role_only" ON public.devices
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "packs_service_role_only" ON public.packs
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate secure random activation code (6 alphanumeric uppercase)
CREATE OR REPLACE FUNCTION generate_activation_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude confusing chars: I, O, 0, 1
  result text := '';
  i int;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to generate secure device token (48 chars)
CREATE OR REPLACE FUNCTION generate_device_token()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..48 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to get latest pack for a tenant
CREATE OR REPLACE FUNCTION get_latest_pack_for_tenant(p_tenant_id uuid)
RETURNS TABLE(id uuid, version int, pack_path text, checksum text, published_at timestamptz)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.version, p.pack_path, p.checksum, p.published_at
  FROM public.packs p
  WHERE p.tenant_id = p_tenant_id
  ORDER BY p.version DESC
  LIMIT 1;
END;
$$;

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it already exists, then recreate
DROP TRIGGER IF EXISTS tenants_updated_at ON public.tenants;

CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

