# Launching Wildfire Allergy Checker on the Apple App Store

Your app is a **Capacitor** (v8) iOS app: React/Vite web app wrapped in a native shell. Here’s how to get it onto the App Store.

---

## 1. Apple Developer Account (required)

- Go to [developer.apple.com](https://developer.apple.com) and enroll in the **Apple Developer Program**.
- Cost: **$99 USD/year**.
- Approval can take 24–48 hours.
- You need this before you can create an app in App Store Connect or submit builds.

---

## 2. Prerequisites on Your Mac

- **Xcode** from the Mac App Store (latest stable).
- **Xcode Command Line Tools**:  
  `xcode-select --install` (if not already installed).
- **CocoaPods** (for Capacitor iOS):  
  `sudo gem install cocoapods`  
  Then in the iOS project:  
  `cd ios/App && pod install`

---

## 3. Build the Web App and Sync to iOS

From the project root:

```bash
npm run build
npx cap sync ios
```

Or use your existing script:

```bash
npm run cap:sync
```

This builds the Vite app into `dist/` and copies it into the iOS app. Do this before every archive you submit.

---

## 4. Open the iOS Project in Xcode

```bash
npx cap open ios
```

Or: open `ios/App/App.xcworkspace` in Xcode (use the **.xcworkspace** file, not .xcodeproj, when using CocoaPods).

---

## 5. Configure Signing & Capabilities in Xcode

1. In Xcode, select the **App** target (not the project).
2. Open the **Signing & Capabilities** tab.
3. Check **Automatically manage signing**.
4. Choose your **Team** (your Apple Developer account). If you don’t see it, add your Apple ID in **Xcode → Settings → Accounts**.
5. Set **Bundle Identifier** to match Capacitor: `com.wildfire.allergychecker` (or whatever you use in `capacitor.config.ts`). It must be unique and consistent.
6. If you need capabilities (e.g. Push Notifications, In-App Purchase), add them here.

---

## 6. Create an App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com).
2. **My Apps** → **+** → **New App**.
3. Choose:
   - **Platform**: iOS
   - **Name**: Wildfire Allergy Checker
   - **Primary Language**
   - **Bundle ID**: select the one that matches your app (e.g. `com.wildfire.allergychecker`). Create it under **Certificates, Identifiers & Profiles** if needed.
   - **SKU**: e.g. `wildfire-allergy-001` (internal use only).

---

## 7. App Store Listing (Metadata & Assets)

In App Store Connect, for your app version (e.g. 1.0):

- **Screenshots**: Required for at least one iPhone size (e.g. 6.7", 6.5") and optionally iPad. Simulator: **File → New Screen Shot** or run on device and capture.
- **App icon**: 1024×1024 px (no transparency). Set in Xcode: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`.
- **Description**, **Keywords**, **Support URL**, **Privacy Policy URL** (required).
- **Category**: e.g. Food & Drink or Health & Fitness.
- **Age Rating**: Complete the questionnaire.
- **Privacy**: If you collect or use any data (e.g. Supabase, analytics), fill out **App Privacy** and consider a **Privacy Policy** URL.

---

## 8. Archive and Upload the Build

1. In Xcode, set the run destination to **Any iOS Device (arm64)** (not a simulator).
2. **Product → Archive**.
3. When the Organizer opens, select the archive and click **Distribute App**.
4. Choose **App Store Connect** → **Upload**.
5. Accept defaults (e.g. upload symbols, manage version and build number).  
   Xcode will upload the build to App Store Connect.

---

## 9. Submit for Review

1. In App Store Connect, open your app and the version (e.g. 1.0).
2. In **Build**, click **+** and select the build you just uploaded (it may take a few minutes to appear).
3. Complete any remaining required fields (e.g. Export Compliance, Advertising Identifier usage).
4. Click **Submit for Review**.

Review often takes 24–48 hours. You’ll get email updates.

---

## 10. After Approval

- You can release **manually** or set the version to **Automatically release after approval**.
- For updates: bump version/build in Xcode, run `npm run cap:sync`, then archive and upload a new build; submit a new version in App Store Connect.

---

## Quick Reference Commands

| Step              | Command / Action                          |
|-------------------|--------------------------------------------|
| Build + sync iOS  | `npm run cap:sync`                         |
| Open iOS in Xcode | `npx cap open ios` or open `ios/App/App.xcworkspace` |
| Archive           | Xcode: **Product → Archive**               |
| Upload            | Organizer → **Distribute App** → App Store Connect |

---

## Troubleshooting

- **“No signing certificate”**: Add your Apple ID in Xcode → Settings → Accounts, then select your Team in Signing & Capabilities.
- **“Bundle ID already in use”**: Your Bundle ID must be unique across all of Apple. Use something like `com.wildfire.allergychecker` or `com.yourcompany.wildfireallergy`.
- **Build not showing in App Store Connect**: Wait 5–15 minutes and refresh; check that the Bundle ID and version/build match.
- **Capacitor / native changes**: After changing `capacitor.config.ts` or native iOS files, run `npx cap sync ios` and reopen Xcode.

---

## Optional: App Store Connect API (for CI/CD)

For automated uploads (e.g. from GitHub Actions), you can use **Transporter** (Mac app), **xcrun altool** (command line), or **fastlane**. That’s optional for a first launch; manual upload from Xcode is enough to get live on the App Store.
