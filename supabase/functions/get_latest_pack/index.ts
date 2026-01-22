// Edge Function: get_latest_pack
// Returns the latest pack version and signed download URL for an activated device

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GetLatestPackRequest {
  deviceToken: string
}

interface GetLatestPackResponse {
  tenantId: string
  version: number
  signedUrl: string
  checksum: string
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    const { deviceToken }: GetLatestPackRequest = await req.json()

    // Validate input
    if (!deviceToken || typeof deviceToken !== 'string') {
      return jsonError('Device token is required', 'invalid_token', 400)
    }

    // 1. Find device by token
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('device_token', deviceToken)
      .single()

    if (deviceError || !device) {
      return jsonError('Invalid device token', 'invalid_token', 401)
    }

    // 2. Check if device is revoked
    if (device.is_revoked) {
      return jsonError('This device has been revoked. Contact support.', 'device_revoked', 403)
    }

    // 3. Update last_seen_at
    await supabase
      .from('devices')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', device.id)

    // 4. Get latest pack for tenant
    const { data: packs, error: packError } = await supabase
      .from('packs')
      .select('*')
      .eq('tenant_id', device.tenant_id)
      .order('version', { ascending: false })
      .limit(1)

    if (packError || !packs || packs.length === 0) {
      return jsonError('No menu data published for this location', 'no_pack_published', 404)
    }

    const latestPack = packs[0]

    // 5. Generate signed URL for pack download (10 minutes)
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('tenant-packs')
      .createSignedUrl(latestPack.pack_path, 600) // 10 minutes

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL error:', signedUrlError)
      return jsonError('Failed to generate download URL', 'url_generation_failed', 500)
    }

    // 6. Return success response
    const response: GetLatestPackResponse = {
      tenantId: device.tenant_id,
      version: latestPack.version,
      signedUrl: signedUrlData.signedUrl,
      checksum: latestPack.checksum,
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Get latest pack error:', error)
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
