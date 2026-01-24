-- ============================================================================
-- ADD VERIFICATION FLAG TO ALLERGEN MODIFICATIONS
-- Enables explicit "VERIFY WITH KITCHEN" status for items requiring manual confirmation
-- ============================================================================

-- Add requires_verification column
ALTER TABLE allergen_modifications
ADD COLUMN IF NOT EXISTS requires_verification BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on verification flag
CREATE INDEX IF NOT EXISTS idx_allergen_mods_verification
ON allergen_modifications(requires_verification)
WHERE requires_verification = true;

-- Add comment explaining the field
COMMENT ON COLUMN allergen_modifications.requires_verification IS
'When TRUE, this item requires manual kitchen verification even if modifications are listed. Shows "VERIFY WITH KITCHEN" on ticket.';

-- Example usage (commented out - uncomment to mark specific items for verification):
-- UPDATE allergen_modifications
-- SET requires_verification = true
-- WHERE dish_name = 'Some Complex Dish' AND allergen = 'shellfish';
