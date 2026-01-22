// Edge Function: rotate_activation_code
// Developer/admin function to create a new activation code for a tenant
// Protected by DEV_SECRET header

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-dev-secret',
}

interface RotateCodeRequest {
  tenantId: string
  deactivatePriorCodes?: boolean
  maxActivations?: number
  expirationDays?: number
}

interface RotateCodeResponse {
  code: string
  expiresAt: string
  maxActivations: number
}

interface ErrorResponse {
  error: string
  code: string
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify DEV_SECRET header
    const devSecret = Deno.env.get('DEV_SECRET')
    const providedSecret = req.headers.get('x-dev-secret')

    if (!devSecret || providedSecret !== devSecret) {
      return jsonError('Unauthorized', 'unauthorized', 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    const {
      tenantId,
      deactivatePriorCodes = false,
      maxActivations = 10,
      expirationDays = 90,
    }: RotateCodeRequest = await req.json()

    // Validate input
    if (!tenantId || typeof tenantId !== 'string') {
      return jsonError('Tenant ID is required', 'invalid_tenant_id', 400)
    }

    // 1. Verify tenant exists and is active
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single()

    if (tenantError || !tenant) {
      return jsonError('Tenant not found', 'tenant_not_found', 404)
    }

    // 2. Optionally deactivate prior codes
    if (deactivatePriorCodes) {
      await supabase
        .from('activation_codes')
        .update({ is_active: false })
        .eq('tenant_id', tenantId)
    }

    // 3. Generate new activation code
    const { data: codeData } = await supabase.rpc('generate_activation_code')
    const newCode = codeData || generateActivationCode()

    // Calculate expiration
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expirationDays)

    // 4. Insert new activation code
    const { data: insertedCode, error: insertError } = await supabase
      .from('activation_codes')
      .insert({
        tenant_id: tenantId,
        code: newCode,
        expires_at: expiresAt.toISOString(),
        max_activations: maxActivations,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      // Handle duplicate code (rare but possible)
      if (insertError.code === '23505') {
        return jsonError('Code generation conflict, please try again', 'code_conflict', 409)
      }
      return jsonError('Failed to create activation code', 'insert_failed', 500)
    }

    // 5. Return success response
    const response: RotateCodeResponse = {
      code: newCode,
      expiresAt: expiresAt.toISOString(),
      maxActivations,
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    })

  } catch (error) {
    console.error('Rotate activation code error:', error)
    return jsonError('Internal server error', 'internal_error', 500)
  }
})

function jsonError(message: string, code: string, status: number): Response {
  const body: ErrorResponse = { error: message, code }
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

function generateActivationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude confusing: I, O, 0, 1
  const array = new Uint8Array(6)
  crypto.getRandomValues(array)
  return Array.from(array, byte => chars[byte % chars.length]).join('')
}
