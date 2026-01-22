// Edge Function: activate
// Activates a device with an activation code, returns device token and pack URL

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ActivateRequest {
  code: string
  deviceFingerprint: string
}

interface ActivateResponse {
  tenant: {
    id: string
    conceptName: string
    locationName: string
  }
  deviceToken: string
  pack: {
    version: number
    signedUrl: string
    checksum: string
  }
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Validate environment
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[activate] Missing env vars:', { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!supabaseServiceKey 
      })
      return jsonError('Server configuration error', 'config_missing', 500)
    }

    console.log('[activate] Using service role key (first 10 chars):', supabaseServiceKey.substring(0, 10) + '...')

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    const { code, deviceFingerprint }: ActivateRequest = await req.json()

    // Validate input
    if (!code || typeof code !== 'string') {
      return jsonError('Activation code is required', 'invalid_code', 400)
    }
    if (!deviceFingerprint || typeof deviceFingerprint !== 'string') {
      return jsonError('Device fingerprint is required', 'invalid_fingerprint', 400)
    }

    const normalizedCode = code.toUpperCase().trim()

    // 1. Find activation code
    const { data: activationCode, error: codeError } = await supabase
      .from('activation_codes')
      .select('*, tenant:tenants(*)')
      .eq('code', normalizedCode)
      .single()

    if (codeError || !activationCode) {
      return jsonError('Invalid activation code', 'invalid_code', 404)
    }

    // 2. Validate activation code status
    if (!activationCode.is_active) {
      return jsonError('Activation code is no longer active', 'expired_code', 400)
    }

    const now = new Date()
    const expiresAt = new Date(activationCode.expires_at)
    if (expiresAt < now) {
      return jsonError('Activation code has expired', 'expired_code', 400)
    }

    // 3. Validate tenant status
    const tenant = activationCode.tenant
    console.log('[activate] Tenant from activation code:', {
      tenantId: tenant?.id,
      conceptName: tenant?.concept_name,
      status: tenant?.status
    })

    if (!tenant || tenant.status !== 'active') {
      return jsonError('Restaurant location is not active', 'tenant_inactive', 400)
    }

    // 4. Check if device already exists for this tenant
    const { data: existingDevice, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('tenant_id', tenant.id)
      .eq('device_fingerprint', deviceFingerprint)
      .single()

    let deviceToken: string

    if (existingDevice) {
      // Device already activated
      if (existingDevice.is_revoked) {
        return jsonError('This device has been revoked. Contact support.', 'device_revoked', 403)
      }
      
      // Return existing token - don't consume another activation
      deviceToken = existingDevice.device_token

      // Update last_seen_at
      await supabase
        .from('devices')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', existingDevice.id)
    } else {
      // New device - check activation limit
      if (activationCode.activations_used >= activationCode.max_activations) {
        return jsonError('Maximum device activations reached for this code', 'max_activations_reached', 400)
      }

      // Generate device token
      const { data: tokenData } = await supabase.rpc('generate_device_token')
      deviceToken = tokenData || generateSecureToken(48)

      // Create device record
      const { error: insertError } = await supabase
        .from('devices')
        .insert({
          tenant_id: tenant.id,
          device_fingerprint: deviceFingerprint,
          device_token: deviceToken,
        })

      if (insertError) {
        console.error('Device insert error:', insertError)
        return jsonError('Failed to register device', 'registration_failed', 500)
      }

      // Increment activations_used atomically
      const { error: updateError } = await supabase
        .from('activation_codes')
        .update({ activations_used: activationCode.activations_used + 1 })
        .eq('id', activationCode.id)

      if (updateError) {
        console.error('Activation count update error:', updateError)
      }
    }

    // 5. Get latest pack for tenant
    console.log('[activate] Querying packs for tenant_id:', tenant.id)
    
    const { data: packs, error: packError } = await supabase
      .from('packs')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('version', { ascending: false })
      .limit(1)

    console.log('[activate] Pack query result:', {
      error: packError?.message || null,
      packsCount: packs?.length || 0,
      firstPack: packs?.[0] ? { 
        id: packs[0].id,
        version: packs[0].version, 
        pack_path: packs[0].pack_path 
      } : null
    })

    if (packError) {
      console.error('[activate] Pack query error:', packError)
      return jsonError('Error fetching menu data: ' + packError.message, 'pack_query_error', 500)
    }

    if (!packs || packs.length === 0) {
      console.error('[activate] No packs found for tenant:', tenant.id)
      return jsonError('No menu data published for this location', 'no_pack_published', 404)
    }

    const latestPack = packs[0]
    console.log('[activate] Using pack:', { version: latestPack.version, path: latestPack.pack_path })

    // 6. Generate signed URL for pack download (10 minutes)
    console.log('[activate] Creating signed URL for path:', latestPack.pack_path)
    
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('tenant-packs')
      .createSignedUrl(latestPack.pack_path, 600) // 10 minutes

    if (signedUrlError || !signedUrlData) {
      console.error('[activate] Signed URL error:', signedUrlError)
      return jsonError('Failed to generate download URL', 'url_generation_failed', 500)
    }

    console.log('[activate] Signed URL created successfully')

    // 7. Return success response
    const response: ActivateResponse = {
      tenant: {
        id: tenant.id,
        conceptName: tenant.concept_name,
        locationName: tenant.location_name,
      },
      deviceToken,
      pack: {
        version: latestPack.version,
        signedUrl: signedUrlData.signedUrl,
        checksum: latestPack.checksum,
      },
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Activation error:', error)
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

function generateSecureToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => chars[byte % chars.length]).join('')
}
