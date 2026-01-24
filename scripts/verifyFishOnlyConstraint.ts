/**
 * Verify Fish-Only VERIFY Constraint
 *
 * This script audits a tenant pack to ensure:
 * 1. VERIFY_WITH_KITCHEN status only appears for Fish allergen
 * 2. All non-fish allergens have deterministic states
 * 3. No dishes have missing allergen rules (all should have entries for each allergen)
 *
 * Usage:
 *   npx tsx scripts/verifyFishOnlyConstraint.ts [path-to-pack.json]
 *
 * Exit codes:
 *   0 = Pack is valid (Fish-only constraint met)
 *   1 = Pack is invalid (constraint violations found)
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = process.cwd();

// Get pack path from args or use default
const packPath = process.argv[2] || path.join(PROJECT_ROOT, 'generated', 'tenant-pack-v1.json');

interface AllergenRule {
  status: string;
  substitutions?: string[];
  notes?: string;
  requiresVerification?: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  allergenRules: Record<string, AllergenRule>;
}

interface TenantPack {
  tenantId: string;
  conceptName: string;
  locationName: string;
  version: number;
  allergens: Array<{ id: string; name: string }>;
  items: MenuItem[];
}

interface Violation {
  dishId: string;
  dishName: string;
  allergenId: string;
  allergenName: string;
  status: string;
  severity: 'ERROR' | 'WARNING';
  message: string;
}

function verifyPack(packPath: string): { valid: boolean; violations: Violation[] } {
  console.log('🔍 Verifying Fish-Only VERIFY Constraint...\n');
  console.log(`   Pack: ${packPath}\n`);

  // Read pack
  if (!fs.existsSync(packPath)) {
    console.error(`❌ Pack not found: ${packPath}`);
    process.exit(1);
  }

  const packJson = fs.readFileSync(packPath, 'utf-8');
  const pack: TenantPack = JSON.parse(packJson);

  console.log(`   Tenant: ${pack.conceptName} - ${pack.locationName}`);
  console.log(`   Version: ${pack.version}`);
  console.log(`   Items: ${pack.items.length}`);
  console.log(`   Allergens: ${pack.allergens.length}`);
  console.log('');

  const violations: Violation[] = [];
  let totalRules = 0;
  let verifyCount = 0;
  let fishVerifyCount = 0;
  let nonFishVerifyCount = 0;

  // Check each item
  for (const item of pack.items) {
    // Check each allergen rule
    for (const [allergenId, rule] of Object.entries(item.allergenRules)) {
      totalRules++;

      // Find allergen name
      const allergenDef = pack.allergens.find((a) => a.id === allergenId);
      const allergenName = allergenDef?.name || allergenId;

      // Check if status is VERIFY_WITH_KITCHEN
      if (rule.status === 'VERIFY_WITH_KITCHEN') {
        verifyCount++;

        if (allergenId === 'fish') {
          // Valid: Fish can use VERIFY
          fishVerifyCount++;
        } else {
          // VIOLATION: Non-fish allergen using VERIFY
          nonFishVerifyCount++;
          violations.push({
            dishId: item.id,
            dishName: item.name,
            allergenId,
            allergenName,
            status: rule.status,
            severity: 'ERROR',
            message: `Non-fish allergen "${allergenName}" has VERIFY_WITH_KITCHEN status (only Fish allowed)`,
          });
        }
      }

      // Check for invalid statuses
      const validStatuses = ['SAFE', 'MODIFIABLE', 'VERIFY_WITH_KITCHEN', 'NOT_SAFE_NOT_IN_SHEET', 'UNSAFE'];
      if (!validStatuses.includes(rule.status)) {
        violations.push({
          dishId: item.id,
          dishName: item.name,
          allergenId,
          allergenName,
          status: rule.status,
          severity: 'ERROR',
          message: `Invalid status "${rule.status}" (must be one of: ${validStatuses.join(', ')})`,
        });
      }
    }

    // Check for missing allergen rules
    for (const allergen of pack.allergens) {
      if (!item.allergenRules[allergen.id]) {
        violations.push({
          dishId: item.id,
          dishName: item.name,
          allergenId: allergen.id,
          allergenName: allergen.name,
          status: 'MISSING',
          severity: 'WARNING',
          message: `Missing allergen rule for "${allergen.name}" (should be NOT_SAFE_NOT_IN_SHEET)`,
        });
      }
    }
  }

  // Print statistics
  console.log('📊 Statistics:');
  console.log(`   Total allergen rules: ${totalRules}`);
  console.log(`   VERIFY_WITH_KITCHEN statuses: ${verifyCount}`);
  console.log(`     - Fish (valid): ${fishVerifyCount}`);
  console.log(`     - Non-fish (INVALID): ${nonFishVerifyCount}`);
  console.log('');

  // Print violations
  const errors = violations.filter((v) => v.severity === 'ERROR');
  const warnings = violations.filter((v) => v.severity === 'WARNING');

  if (errors.length > 0) {
    console.log(`❌ ${errors.length} ERROR(S) FOUND:`);
    console.log('─'.repeat(80));
    for (const violation of errors) {
      console.log(`   Dish: ${violation.dishName} (${violation.dishId})`);
      console.log(`   Allergen: ${violation.allergenName} (${violation.allergenId})`);
      console.log(`   Status: ${violation.status}`);
      console.log(`   Error: ${violation.message}`);
      console.log('─'.repeat(80));
    }
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} WARNING(S):`);
    console.log('─'.repeat(80));
    for (const warning of warnings.slice(0, 10)) {
      console.log(`   Dish: ${warning.dishName}`);
      console.log(`   Allergen: ${warning.allergenName}`);
      console.log(`   Warning: ${warning.message}`);
      console.log('─'.repeat(80));
    }
    if (warnings.length > 10) {
      console.log(`   ... and ${warnings.length - 10} more warnings`);
    }
    console.log('');
  }

  // Final verdict
  const valid = errors.length === 0;

  if (valid) {
    console.log('✅ PACK IS VALID');
    console.log('   Fish-Only VERIFY constraint is satisfied');
    console.log('   All non-fish allergens have deterministic states');
  } else {
    console.log('❌ PACK IS INVALID');
    console.log(`   ${errors.length} constraint violation(s) found`);
    console.log('   Fix errors and regenerate pack');
  }

  return { valid, violations };
}

// Run verification
const result = verifyPack(packPath);

// Exit with appropriate code
process.exit(result.valid ? 0 : 1);
