-- Migration 022: Brunch Sides Support
-- Adds support for dedicated brunch side selection flow

-- Add flags for side selection flow
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS is_side_only BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_entree BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS side_ids JSONB DEFAULT '[]'::jsonb;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_is_side_only
  ON menu_items(is_side_only) WHERE is_side_only = TRUE;
CREATE INDEX IF NOT EXISTS idx_menu_items_is_entree
  ON menu_items(is_entree) WHERE is_entree = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN menu_items.is_side_only IS 'If true, item only appears in side selection, not main menu grid';
COMMENT ON COLUMN menu_items.is_entree IS 'If true, item triggers side selection step after selection';
COMMENT ON COLUMN menu_items.side_ids IS 'Array of menu_item UUIDs that can be selected as sides for this entrée';
