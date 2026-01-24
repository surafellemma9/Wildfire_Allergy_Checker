/**
 * Pack Verification Script
 * 
 * Usage: npx tsx scripts/verifyPack.ts
 * 
 * Verifies that the generated pack is correctly formatted for the app.
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = process.cwd();
const PACK_PATH = path.join(PROJECT_ROOT, 'generated', 'tenant-pack-v1.json');

interface AllergenRule {
  status: string;
  substitutions?: string[];
  modifications?: string[];
  notes?: string;
}

interface PackItem {
  id: string;
  name: string;
  categoryId?: string;
  category?: string;
  allergenRules: Record<string, AllergenRule>;
}

interface Pack {
  version: number;
  items: PackItem[];
  categories: { id: string; name: string }[];
  allergens: { id: string; name: string }[];
}

function verify() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 PACK VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Pack path: ${PACK_PATH}\n`);

  if (!fs.existsSync(PACK_PATH)) {
    console.error('❌ Pack file not found!');
    process.exit(1);
  }

  const packJson = fs.readFileSync(PACK_PATH, 'utf-8');
  const pack: Pack = JSON.parse(packJson);

  let errors: string[] = [];
  let warnings: string[] = [];

  // Test 1: Basic structure
  console.log('📋 Test 1: Basic Structure');
  console.log(`   Version: ${pack.version}`);
  console.log(`   Items: ${pack.items.length}`);
  console.log(`   Categories: ${pack.categories.length}`);
  console.log(`   Allergens: ${pack.allergens.length}`);
  
  if (pack.items.length === 0) errors.push('No items in pack');
  if (pack.categories.length === 0) errors.push('No categories in pack');
  if (pack.allergens.length === 0) errors.push('No allergens in pack');
  
  console.log(errors.length === 0 ? '   ✅ PASS\n' : '   ❌ FAIL\n');

  // Test 2: Items have categoryId (not just category)
  console.log('📋 Test 2: Items have categoryId field');
  const itemsWithCategoryId = pack.items.filter(i => i.categoryId);
  const itemsWithOnlyCategory = pack.items.filter(i => !i.categoryId && i.category);
  console.log(`   Items with categoryId: ${itemsWithCategoryId.length}`);
  console.log(`   Items with only category (legacy): ${itemsWithOnlyCategory.length}`);
  
  if (itemsWithOnlyCategory.length > 0) {
    warnings.push(`${itemsWithOnlyCategory.length} items use legacy 'category' field instead of 'categoryId'`);
    console.log('   ⚠️ WARNING: Some items use legacy format\n');
  } else {
    console.log('   ✅ PASS\n');
  }

  // Test 3: Category IDs match
  console.log('📋 Test 3: Category IDs match between categories and items');
  const categoryIds = new Set(pack.categories.map(c => c.id));
  const itemCategoryIds = new Set(pack.items.map(i => i.categoryId).filter(Boolean));
  const unmatchedCategories = [...itemCategoryIds].filter(id => !categoryIds.has(id as string));
  
  console.log(`   Category IDs in categories: ${categoryIds.size}`);
  console.log(`   Unique categoryIds in items: ${itemCategoryIds.size}`);
  
  if (unmatchedCategories.length > 0) {
    errors.push(`Item categoryIds not in categories list: ${unmatchedCategories.join(', ')}`);
    console.log(`   ❌ FAIL: Unmatched: ${unmatchedCategories.join(', ')}\n`);
  } else {
    console.log('   ✅ PASS\n');
  }

  // Test 4: Allergen rule status format
  console.log('📋 Test 4: Allergen rule status format (SAFE/MODIFY/UNSAFE/UNKNOWN)');
  const validStatuses = ['SAFE', 'MODIFY', 'UNSAFE', 'UNKNOWN'];
  let invalidStatuses: string[] = [];
  let legacyStatuses: string[] = [];
  
  for (const item of pack.items) {
    for (const [allergenId, rule] of Object.entries(item.allergenRules)) {
      if (!validStatuses.includes(rule.status)) {
        if (['safe', 'modifiable', 'not_modifiable', 'unknown'].includes(rule.status)) {
          legacyStatuses.push(`${item.name}/${allergenId}: ${rule.status}`);
        } else {
          invalidStatuses.push(`${item.name}/${allergenId}: ${rule.status}`);
        }
      }
    }
  }
  
  if (legacyStatuses.length > 0) {
    errors.push(`${legacyStatuses.length} rules use legacy lowercase status`);
    console.log(`   ❌ FAIL: ${legacyStatuses.length} legacy statuses found`);
    console.log(`   First few: ${legacyStatuses.slice(0, 3).join(', ')}\n`);
  } else if (invalidStatuses.length > 0) {
    errors.push(`${invalidStatuses.length} rules have invalid status`);
    console.log(`   ❌ FAIL: ${invalidStatuses.length} invalid statuses\n`);
  } else {
    console.log('   ✅ PASS\n');
  }

  // Test 5: Allergen rules use 'substitutions' not 'modifications'
  console.log('📋 Test 5: Allergen rules use "substitutions" field');
  let usesSubstitutions = 0;
  let usesModifications = 0;
  
  for (const item of pack.items) {
    for (const rule of Object.values(item.allergenRules)) {
      if (rule.substitutions && rule.substitutions.length > 0) usesSubstitutions++;
      if (rule.modifications && (rule.modifications as string[]).length > 0) usesModifications++;
    }
  }
  
  console.log(`   Rules with 'substitutions': ${usesSubstitutions}`);
  console.log(`   Rules with 'modifications' (legacy): ${usesModifications}`);
  
  if (usesModifications > 0) {
    errors.push(`${usesModifications} rules use legacy 'modifications' field`);
    console.log('   ❌ FAIL: Some rules use legacy field\n');
  } else {
    console.log('   ✅ PASS\n');
  }

  // Test 6: Specific test - Baked French Onion Soup + gluten
  console.log('📋 Test 6: Sample lookup - "Baked French Onion Soup" + gluten');
  const soupItem = pack.items.find(i => i.name === 'Baked French Onion Soup');
  
  if (!soupItem) {
    errors.push('Baked French Onion Soup not found in pack');
    console.log('   ❌ FAIL: Item not found\n');
  } else {
    console.log(`   Found item: ${soupItem.name}`);
    console.log(`   categoryId: ${soupItem.categoryId}`);
    
    const glutenRule = soupItem.allergenRules.gluten;
    if (!glutenRule) {
      errors.push('No gluten rule for Baked French Onion Soup');
      console.log('   ❌ FAIL: No gluten rule\n');
    } else {
      console.log(`   gluten.status: ${glutenRule.status}`);
      console.log(`   gluten.substitutions: ${JSON.stringify(glutenRule.substitutions)}`);
      
      if (glutenRule.status !== 'MODIFY') {
        errors.push(`Expected status MODIFY, got ${glutenRule.status}`);
        console.log('   ❌ FAIL: Wrong status\n');
      } else if (!glutenRule.substitutions || glutenRule.substitutions.length === 0) {
        errors.push('No substitutions for gluten');
        console.log('   ❌ FAIL: No substitutions\n');
      } else {
        console.log('   ✅ PASS\n');
      }
    }
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All tests passed! Pack is correctly formatted.');
  } else {
    if (warnings.length > 0) {
      console.log(`\n⚠️ Warnings (${warnings.length}):`);
      warnings.forEach(w => console.log(`   - ${w}`));
    }
    if (errors.length > 0) {
      console.log(`\n❌ Errors (${errors.length}):`);
      errors.forEach(e => console.log(`   - ${e}`));
      process.exit(1);
    }
  }
}

verify();
