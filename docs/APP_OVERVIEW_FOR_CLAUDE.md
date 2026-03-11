# Wildfire Allergy App — Overview for Claude

This document answers common questions about the project structure, dependencies, tech stack, data models, and UI flow. Use it to onboard Claude or other AI assistants quickly.

---

## 1. Project Structure

**Top-level layout:**

- **`src/`** — Main app source (React + TypeScript). This is the app; iOS/Android are shells.
- **`ios/`** — Capacitor iOS project (Xcode app that loads the web app).
- **`android/`** — Capacitor Android project.
- **`supabase/`** — Backend: migrations, Edge Functions (e.g. `activate`, `get_latest_pack`).
- **`scripts/`** — Data and migration scripts (TypeScript, Python, SQL).
- **`docs/`** — Documentation (e.g. this file, `APP_STORE_LAUNCH.md`).
- **`dist/`** — Vite build output (what Capacitor serves in native apps).
- **Root config:** `package.json`, `vite.config.ts`, `capacitor.config.ts`, `tsconfig.json`, `tailwind.config.js`, `index.html`, `.env` / `.env.example`, various `.md` docs.

**Important paths:**

| Purpose              | Path |
|----------------------|------|
| Web entry HTML       | `index.html` |
| JS/React entry       | `src/main.tsx` |
| App root component   | `src/App.tsx` |
| Main checker UI      | `src/components/TenantAllergyChecker.tsx` |
| Allergy engine      | `src/core/checker/checker.ts` |
| Tenant/pack types    | `src/core/tenant/packTypes.ts` |
| Tenant hook + API    | `src/core/tenant/useTenant.ts`, `packClient.ts` |
| Pages                | `src/pages/` (LocationVerificationPage, SettingsPage) |
| iOS entry            | `ios/App/App/AppDelegate.swift` |
| iOS Capacitor SPM    | `ios/App/CapApp-SPM/Package.swift` |

---

## 2. Dependency Management

- **CocoaPods:** Not used (no `Podfile`).
- **Swift Package Manager:** Used only for the iOS Capacitor app. Single package: `ios/App/CapApp-SPM/Package.swift` — pulls in `capacitor-swift-pm` and Capacitor plugins (App, Haptics, Keyboard, SplashScreen, StatusBar). File is managed by Capacitor CLI.
- **Main app:** npm via `package.json` (React, Vite, Capacitor, Tailwind, Supabase client, etc.).

---

## 3. Language & Framework

- **UI:** **React 18 + TypeScript**. Styling: **Tailwind CSS**. Build: **Vite**.
- **Mobile:** **Capacitor**. The “app” is the same web app; iOS and Android are thin native shells that load the built web app in a WebView.
- **iOS shell:** **UIKit** (not SwiftUI). Entry: `AppDelegate.swift` (`@UIApplicationMain`). Initial scene is `CAPBridgeViewController` from Capacitor, which hosts the WebView. No Swift UI code for screens — all screens are React.
- **Main entry for the UI you work on:** `src/main.tsx` → `src/App.tsx`.

---

## 4. Data Models (Dishes, Allergens, Modifications)

The **authoritative runtime types** for the checker and UI live in **`src/core/tenant/packTypes.ts`**. Supabase/DB types are in **`src/lib/database.types.ts`** and legacy app types in **`src/types.ts`**.

### Pack / runtime (used by checker and UI)

- **Allergen (display):** `AllergenDef` — `{ id, name, icon? }`. Allergen ids: `AllergenId` (e.g. `dairy`, `gluten`, `shellfish`, `fish`, `egg`, `soy`, `peanuts`, `tree_nuts`, `sesame`, `msg`, `onion_garlic`, `tomato`, `seed`, `custom`).
- **Rule status (per allergen):** `RuleStatus` — `'SAFE' | 'MODIFIABLE' | 'VERIFY_WITH_KITCHEN' | 'NOT_SAFE_NOT_IN_SHEET' | 'UNSAFE'`.
- **Per-allergen rule:** `AllergenRule` — `{ status, foundIngredients?, substitutions?, notes?, requiresVerification? }`.
- **Dish (menu item):** `MenuItem` — `id`, `name`, `categoryId`, `ticketCode?`, `description?`, flags (`isEntree?`, `isSideOnly?`, `requiresCrust?`, `requiresAddOns?`), optional arrays (`sides?`, `crustOptions?`, `dressingOptions?`, `addOnOptions?`), `ingredients?`, `garnishes?`, `defaultBread?`, and **`allergenRules: Record<string, AllergenRule>`**.
- **Options:** `SideOption`, `CrustOption`, `DressingOption`, `AddOnOption` (dressings can carry their own `allergenRules`).
- **Category:** `Category` — `{ id, name, icon?, sortOrder?, needsReview? }`.
- **Pack payload:** `TenantPack` — tenant/location/version metadata, `allergens`, `categories`, **`items: MenuItem[]`**, plus optional `allIngredients`, `breads`, `compoundIngredients`, etc.

So: **dishes** = `MenuItem` (with `allergenRules`); **allergens** = `AllergenDef` + `AllergenId`; **modifications** = inside `AllergenRule` (e.g. `substitutions`, `notes`, `status`).

### Checker (input/output)

- **Input:** `CheckerSelections` in `src/core/checker/checker.ts` — `allergenIds`, `itemId`, `sideId?`, `crustId?`, `crustIds?`, `dressingId?`, `addOnIds?`, `customAllergenText?`, `customIngredients?`.
- **Output:** `ItemCheckResult` (item id/name, overall `status`, `canBeModified`, `perAllergen: PerAllergenResult[]` with status, found ingredients, substitutions, notes), plus optional `consolidated` modifications.

### DB / legacy

- **`src/lib/database.types.ts`:** Supabase-facing `MenuItem`, `AllergenModification` (dish_id, modifications[], can_be_modified, notes), `CompositeIngredient`, and table mappings.
- **`src/types.ts`:** Legacy `MenuItem` (flat `contains_*` booleans), `AllergyCheckResult`, `Allergen` union — used where old shape is still referenced.

---

## 5. Current UI Flow

Navigation is **state-based in `App.tsx`** (no React Router).

1. **Loading (no pack yet)**  
   Full-screen “Loading…” (and “Offline - loading cached data” when applicable).

2. **Not activated (no tenant context)**  
   **LocationVerificationPage** — user enters activation/location; **onActivate** → `activate()` from `useTenant()`. On success, tenant context is set and pack is fetched.

3. **Activated but no pack (and not loading)**  
   Error screen: “Unable to load menu data” with Retry (reload).

4. **Activated and pack loaded**  
   - **Settings:** If `currentPage === 'settings'` → **SettingsPage** (tenant/location, last updated, offline/cache, Check for updates, Reset). Back → `setCurrentPage('main')`.
   - **Main:** Otherwise → **TenantAllergyChecker**.

5. **TenantAllergyChecker (main flow)** — step-based (single component, no route changes):
   - **Step 1 – Allergies:** Select allergens (and optional custom ingredient search). Continue → step 2.
   - **Step 2 – Dish:** Category filter + search; pick a dish. Next step depends on dish type:
     - Salad with dressings → **Step 3 – Dressing** (then optional protein, then results).
     - Salad with proteins → **Step 3 – Protein** (then optional dressing, then results).
     - Entrée with sides → **Step 3 – Sides** (then optional crust if applicable, then results).
     - Pizza/steak with crust → **Step 3 – Crust** (then results).
     - Otherwise → **Results**.
   - **Step 3 (when present):** Dressing **or** Protein **or** Sides **or** Crust — one (or more where applicable) selection, then Continue to results.
   - **Step 4 – Results:** Safety result (safe / modifiable / verify / unsafe), per-allergen breakdown, substitutions, disclaimer. User can go Back (to allergies or dish) or start over.

From the main checker, **Settings** is opened via **onOpenSettings** → `setCurrentPage('settings')`; Back from Settings returns to **TenantAllergyChecker**.

**Flow summary:**  
**LocationVerificationPage** → (activate) → **TenantAllergyChecker** (allergies → dish → [dressing | protein | sides | crust] → results), with **Settings** as a side page from main.

---

## 6. Results Step & Settings (Additional Q&A)

### 6.1 Results step in TenantAllergyChecker — data available at results

When `currentStep === 'results'` there are two branches:

1. **Ingredients view** (`showAllIngredients && selectedItem`): Renders **IngredientsView** with `item`, `dressing`, `pack`, `onStartOver`. Used when the user chose “Show all ingredients” instead of a standard allergy result.

2. **Standard results** (`!showAllIngredients && checkerResult`): Renders **ResultsView** with:
   - **`result`** — `CheckerResult` (see below)
   - **`selectedAllergens`** — `pack.allergens.filter(a => selectedAllergens.includes(a.id))` (display names/icons)
   - **`selectedDressing`** — `DressingOption | null` (so the UI can show “with [dressing name]”)
   - **`onStartOver`** — handler to reset flow

**`checkerResult`** is computed in a `useMemo` that calls `checkAllergens(pack, selections)`. Inputs to that memo (and thus available at results) are:

- **Allergens selected:** `selectedAllergens` (allergen ids), `customAllergenText`, `selectedCustomIngredients`
- **Dish:** `selectedItem` (full `MenuItem`)
- **Options:** `selectedSide`, `selectedCrusts` (array), `selectedDressing`, `selectedProtein`

So at results you have in scope: `selectedItem`, `selectedSide`, `selectedCrusts`, `selectedDressing`, `selectedProtein`, `selectedAllergens`, `customAllergenText`, `selectedCustomIngredients`, and **`checkerResult`**.

**`CheckerResult` shape** (`src/core/checker/checker.ts`):

```ts
interface CheckerResult {
  overallStatus: RuleStatus;           // SAFE | MODIFIABLE | VERIFY_WITH_KITCHEN | NOT_SAFE_NOT_IN_SHEET | UNSAFE
  mainItem: ItemCheckResult;           // itemName, ticketCode, status, canBeModified, perAllergen[], consolidated?
  sideItem?: ItemCheckResult;          // if a side was selected
  crustItem?: ItemCheckResult;         // if crust(s) selected (merged when multiple)
  dressingItem?: ItemCheckResult;      // dressing-only result (dressing rules merged into mainItem in UI)
  addOnItems?: ItemCheckResult[];      // steak add-ons, if any
  customAllergenWarning?: string;      // free-text allergen warning
  customIngredientResults?: IngredientCheckResult[];  // custom ingredient search results
  ticketLines: string[];                // kitchen ticket lines
}
```

**`ItemCheckResult`** (each of `mainItem`, `sideItem`, etc.):

- `itemId`, `itemName`, `ticketCode?`, `status`, `canBeModified`
- **`perAllergen`:** `PerAllergenResult[]` — `allergenId`, `allergenName`, `status`, `foundIngredients`, `substitutions`, `notes`
- **`consolidated?`:** `ConsolidatedModifications` — grouped for display: `bread` (selected/rejected), `removals` (sauce, garnish, seasoning, other), `substitutions` (protein, other), `preparation`, `notes`

**ResultsView** uses:
- **Status card:** `result.overallStatus` + `selectedAllergens` (pills)
- **Order card:** `result.mainItem` (name, ticketCode, status, preparation notes), optional `selectedDressing` label, then `result.sideItem`, `result.crustItem` (each with status + **PreparationNotes**), then `result.customAllergenWarning`, `result.customIngredientResults`
- **PreparationNotes** (per item): For SAFE → “No changes needed”. For UNSAFE / VERIFY / NOT_SAFE → per-allergen notes. For MODIFIABLE → uses **`result.consolidated`** to show bread, removals, substitutions, preparation in a grouped way.

So at the results stage you have: **selected allergens** (ids + display list), **full dish and options** (item, side, crusts, dressing, protein), **checkerResult** (overall status, main/side/crust/dressing/addOn results, per-allergen status/substitutions/notes, consolidated modifications, custom warning, custom ingredient results, ticket lines). Nothing else is persisted for the results screen; it’s all derived from the same state that fed `checkAllergens`.

### 6.2 SettingsPage — what is saved and how it’s persisted

**SettingsPage does not persist its own settings.** It is a read-only view plus actions:

- **Displayed (from props):** `tenantContext` (concept name, location name), `pack` (version, item count), `lastUpdated`, `isOffline`, `isUsingCache`. These come from `App` via `useTenant()`.
- **Actions:** “Check for Updates” → `onCheckForUpdates()`, “Copy Device ID” → `getDeviceFingerprint()` (no save), “Reset / Change Restaurant” → `onReset()` (clears data and requires re-activation). Debug section runs smoke check and shows pack info; no persistence.

**What is actually persisted** (and where) lives in the **tenant** module:

- **`src/core/tenant/storage.ts`** — IndexedDB (DB name: `wildfire_allergy_db`) with fallback to `localStorage`:
  - **Tenant context:** `getTenantContext()` / `saveTenantContext()` / `clearTenantContext()`. Store key `'context'`; data shape `TenantContext` (`tenantId`, `conceptName`, `locationName`, `deviceToken`). Fallback key: `localStorage['wildfire_tenant_context']`.
  - **Cached pack:** `getCachedPack()` / `saveCachedPack()` / `clearCachedPack()`. Store key `'pack'`; data shape `CachedPack` (`pack`, `checksum`, `storedAt`). Fallback key: `localStorage['wildfire_cached_pack']`.
- **Device fingerprint:** `src/core/tenant/deviceFingerprint.ts` — stored in **localStorage** (key from that module); used for activation and “Copy Device ID”.
- **Disclaimer:** In **TenantAllergyChecker**, `localStorage['wildfire_disclaimer_accepted']` is set when the user accepts the disclaimer (not in SettingsPage).

So: **no app-level “settings” (e.g. theme or preferences) are saved in SettingsPage.** Persistence is tenant context + cached pack + device fingerprint + disclaimer flag, all via `src/core/tenant` (IndexedDB + localStorage).

### 6.3 Service / utility pattern for a new PrintService

- **Services** live in **`src/services/`**. The only current example is **`menu-service.ts`**:
  - Single default export not used; the file exports **named async functions** that do one thing each: `fetchMenuItems()`, `fetchAllergenModifications()`, `getDishModification()`, `fetchAllModifications()`, plus helpers `clearCache()`, `isUsingSupabase()`.
  - Uses a **module-level cache** (e.g. `menuItemsCache`, `modificationsCache`) and optional fallbacks (e.g. static data if Supabase is missing).
  - Imports from `@/lib` and `@/types` (or `../lib`, `../types`). No React; pure TS.
  - JSDoc at top describing the module’s role.

- **Utilities** live in **`src/utils/`**. They are **pure helpers or small modules**: `validation.ts`, `normalizeDishName.ts`, `modifications-cache.ts`, `allergy-checker.ts`, `cn.ts`, `use-online-status.ts` (hook). Naming is kebab-case for files; exports are named (functions or hooks).

**Recommendation for `PrintService.ts`:** Put it in **`src/services/printService.ts`** (or `PrintService.ts` if you want to match a class-style name; the repo uses kebab-case for service files). Follow the **service** pattern:

- **File:** `src/services/printService.ts`.
- **Style:** Named exports of **async or sync functions** (e.g. `printResults(options)`, `canPrint()`, etc.), not a default-exported class unless you prefer that for dependency injection.
- **No React** inside the service; keep it plain TS. If you need React (e.g. for a print hook), add a small hook in `utils` or in the component that uses the service.
- **Imports:** From `@/core/checker` (e.g. `CheckerResult`) and `@/core/tenant` (types) as needed; avoid importing heavy UI.
- **JSDoc:** Short module description at top and per-function comments.
- **Naming:** Match existing style: `menu-service.ts` → `printService.ts` or `print-service.ts` (both are consistent with the repo).

So: **create `src/services/printService.ts`** with named functions (e.g. `printResult(...)`), document the module, and call it from the results UI (e.g. a “Print” button in **ResultsView** or **TenantAllergyChecker**). No existing “PrintService” exists; this pattern matches the only current service and keeps UI-agnostic logic in `services/`.

---

## Quick summary for Claude

- **Stack:** React (TS) + Vite + Tailwind; Capacitor for iOS/Android; Supabase backend; versioned **TenantPack** (categories + MenuItems with `allergenRules`).
- **iOS:** UIKit shell (AppDelegate + CAPBridgeViewController); no SwiftUI; all screens are React.
- **Feature:** Multi-step allergy checker: select allergens → pick dish → optional dressing/protein/sides/crust → results (safe / modifiable / verify / unsafe + substitutions). Device activation and offline cache supported.

For more product/launch context, see **`docs/APP_STORE_LAUNCH.md`**.
