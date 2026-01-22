/**
 * Upload Tenant Pack to Supabase Storage
 * 
 * This script uploads a generated pack to Supabase Storage
 * and creates a record in the packs table.
 * 
 * Usage: 
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx TENANT_ID=xxx npx tsx scripts/uploadPackToSupabase.ts
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ✅ ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


console.log('[DEBUG] Project root:', PROJECT_ROOT);

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TENANT_ID = process.env.TENANT_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:');
  console.error('  SUPABASE_URL - Your Supabase project URL');
  console.error('  SUPABASE_SERVICE_KEY - Your Supabase service role key');
  process.exit(1);
}

if (!TENANT_ID) {
  console.error('Missing TENANT_ID environment variable');
  console.error('First create a tenant in the database, then set TENANT_ID');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

async function uploadPack() {
  console.log('Uploading Tenant Pack to Supabase...\n');
  
  // Read the generated pack - use PROJECT_ROOT for ESM compatibility
  const packPath = path.join(PROJECT_ROOT, 'generated', 'tenant-pack-v1.json');
  console.log(`[DEBUG] Reading pack from: ${packPath}`);
  
  if (!fs.existsSync(packPath)) {
    console.error(`❌ Pack file not found at: ${packPath}`);
    console.error('Run generateTenantPack.ts first.');
    process.exit(1);
  }
  
  const packJson = fs.readFileSync(packPath, 'utf-8');
  const pack = JSON.parse(packJson);
  
  // Update tenant ID in pack
  pack.tenantId = TENANT_ID;
  const finalPackJson = JSON.stringify(pack, null, 2);
  
  // Calculate checksum
  const checksum = crypto.createHash('sha256').update(finalPackJson).digest('hex');
  
  // Get latest version for this tenant
  const { data: existingPacks, error: packError } = await supabase
    .from('packs')
    .select('version')
    .eq('tenant_id', TENANT_ID)
    .order('version', { ascending: false })
    .limit(1);
  
  if (packError) {
    console.error('Error fetching existing packs:', packError);
    process.exit(1);
  }
  
  const newVersion = (existingPacks?.[0]?.version ?? 0) + 1;
  const storagePath = `${TENANT_ID}/v${newVersion}.json`;
  
  console.log(`Tenant ID: ${TENANT_ID}`);
  console.log(`Version: ${newVersion}`);
  console.log(`Storage path: ${storagePath}`);
  console.log(`Checksum: ${checksum}`);
  
  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('tenant-packs')
    .upload(storagePath, finalPackJson, {
      contentType: 'application/json',
      upsert: false,
    });
  
  if (uploadError) {
    console.error('Error uploading to storage:', uploadError);
    process.exit(1);
  }
  
  console.log('✓ Uploaded to storage');
  
  // Insert pack record
  const { error: insertError } = await supabase
    .from('packs')
    .insert({
      tenant_id: TENANT_ID,
      version: newVersion,
      pack_path: storagePath,
      checksum,
    });
  
  if (insertError) {
    console.error('Error inserting pack record:', insertError);
    // Try to clean up the uploaded file
    await supabase.storage.from('tenant-packs').remove([storagePath]);
    process.exit(1);
  }
  
  console.log('✓ Pack record created');
  console.log('\n✅ Pack uploaded successfully!');
  console.log(`\nVersion ${newVersion} is now available for devices.`);
}

uploadPack().catch(console.error);
