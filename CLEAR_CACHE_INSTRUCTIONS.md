# How to Clear App Cache

## The Problem
Your app is displaying old category data because it's cached in the browser's IndexedDB storage. The generated pack file is correct, but the app hasn't loaded it yet.

## Quick Fix Options

### Option 1: Use the Settings Page (Easiest)
1. Open your app in the browser
2. Click the ⚙️ Settings icon
3. Click the "Check for Updates" button
4. Wait for it to say "Updated!" or "Already up to date"
5. Go back and verify categories are merged

### Option 2: Clear Browser Cache Manually

#### Chrome/Edge:
1. Open Developer Tools (F12 or right-click > Inspect)
2. Go to the **Application** tab
3. In the left sidebar, find **Storage**
4. Click **"Clear site data"**
5. Reload the page (Ctrl+R or Cmd+R)

#### Firefox:
1. Open Developer Tools (F12)
2. Go to the **Storage** tab
3. Right-click on **IndexedDB** > Delete All
4. Right-click on **Local Storage** > Delete All
5. Reload the page

#### Safari:
1. Open Developer Tools (Cmd+Option+I)
2. Go to **Storage** tab
3. Click **"Clear All"** at the top
4. Reload the page

### Option 3: Reset the App
1. Open Settings in the app
2. Scroll to "Danger Zone"
3. Click "Reset / Change Restaurant"
4. Re-enter your activation code

## Verify the Fix
After clearing cache, you should see:
- "Chicken & BBQ" category (merged from Chicken, BBQ, and Ribs)
- "Specials" category (containing 5 nightly specials)
- "Kids Menu" (no duplicate Kids category)
- Total of 11 categories instead of 18

## For Development
If you're running a local dev server and want to test the generated pack immediately, you'll need to set up a way to serve the `generated/tenant-pack-v1.json` file or update the pack in Supabase.
