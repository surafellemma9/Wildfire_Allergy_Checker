/**
 * Migrate Pack Statuses to Canonical Format
 *
 * This script reads a tenant pack and migrates legacy status names to canonical format:
 * - 'MODIFY' → 'MODIFIABLE'
 * - 'UNKNOWN' → 'NOT_SAFE_NOT_IN_SHEET'
 * - 'modifiable' → 'MODIFIABLE'
 * - 'unknown' → 'NOT_SAFE_NOT_IN_SHEET'
 *
 * Usage:
 *   npx tsx scripts/migratePackStatuses.ts [input-pack.json] [output-pack.json]
 *
 * If output path not specified, overwrites input file.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const PROJECT_ROOT = process.cwd();

// Get paths from args
const inputPath = process.argv[2] || path.join(PROJECT_ROOT, 'generated', 'tenant-pack-v1.json');
const outputPath = process.argv[3] || inputPath;

interface AllergenRule {
  status: string;
  substitutions?: string[];
  notes?: string;
  requiresVerification?: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  allergenRules: Record<string, AllergenRule>;
  [key: string]: unknown;
}

interface TenantPack {
  items: MenuItem[];
  [key: string]: unknown;
}

const STATUS_MIGRATION: Record<string, string> = {
  // Canonical (no change)
  'SAFE': 'SAFE',
  'MODIFIABLE': 'MODIFIABLE',
  'VERIFY_WITH_KITCHEN': 'VERIFY_WITH_KITCHEN',
  'NOT_SAFE_NOT_IN_SHEET': 'NOT_SAFE_NOT_IN_SHEET',
  'UNSAFE': 'UNSAFE',

  // Legacy migrations
  'MODIFY': 'MODIFIABLE',
  'UNKNOWN': 'NOT_SAFE_NOT_IN_SHEET',
  'safe': 'SAFE',
  'modifiable': 'MODIFIABLE',
  'not_modifiable': 'UNSAFE',
  'unknown': 'NOT_SAFE_NOT_IN_SHEET',
  'verify_with_kitchen': 'VERIFY_WITH_KITCHEN',
};

function migratePack(packPath: string): { pack: TenantPack; changes: number } {
  console.log('🔄 Migrating Pack Statuses to Canonical Format...\n');
  console.log(`   Input:  ${packPath}\n`);

  // Read pack
  if (!fs.existsSync(packPath)) {
    console.error(`❌ Pack not found: ${packPath}`);
    process.exit(1);
  }

  const packJson = fs.readFileSync(packPath, 'utf-8');
  const pack: TenantPack = JSON.parse(packJson);

  console.log(`   Items: ${pack.items.length}`);

  let changes = 0;

  // Migrate each item's allergen rules
  for (const item of pack.items) {
    if (!item.allergenRules) continue;

    for (const [allergenId, rule] of Object.entries(item.allergenRules)) {
      if (!rule || !rule.status) continue;

      const oldStatus = rule.status;
      const newStatus = STATUS_MIGRATION[oldStatus];

      if (newStatus && newStatus !== oldStatus) {
        rule.status = newStatus;
        changes++;

        if (changes <= 5) {
          console.log(`   Migrating: ${item.name} / ${allergenId}: "${oldStatus}" → "${newStatus}"`);
        }
      } else if (!newStatus) {
        // Unknown status - default to NOT_SAFE
        console.warn(`   ⚠️ Unknown status "${oldStatus}" for ${item.name} / ${allergenId}, setting to NOT_SAFE_NOT_IN_SHEET`);
        rule.status = 'NOT_SAFE_NOT_IN_SHEET';
        changes++;
      }
    }
  }

  if (changes > 5) {
    console.log(`   ... and ${changes - 5} more changes`);
  }

  console.log(`\n   Total status migrations: ${changes}`);

  return { pack, changes };
}

// Run migration
const { pack, changes } = migratePack(inputPath);

if (changes === 0) {
  console.log('\n✅ No migrations needed - pack already uses canonical statuses');
  process.exit(0);
}

// Write migrated pack
const packJson = JSON.stringify(pack, null, 2);
fs.writeFileSync(outputPath, packJson);

// Update checksum
const checksum = crypto.createHash('sha256').update(packJson).digest('hex');
const checksumPath = path.join(path.dirname(outputPath), 'checksums.json');

if (fs.existsSync(checksumPath)) {
  const checksums = JSON.parse(fs.readFileSync(checksumPath, 'utf-8'));
  checksums.v1 = checksum;
  fs.writeFileSync(checksumPath, JSON.stringify(checksums, null, 2));
  console.log(`   Updated checksum: ${checksum.substring(0, 16)}...`);
}

console.log(`\n✅ Pack migrated successfully!`);
console.log(`   Output: ${outputPath}`);
console.log(`   Size:   ${(packJson.length / 1024).toFixed(2)} KB`);

process.exit(0);
