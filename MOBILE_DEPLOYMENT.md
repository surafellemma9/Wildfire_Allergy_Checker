# Mobile App Deployment Guide

This guide covers how to build and deploy the Wildfire Allergy Checker app to iOS App Store and Google Play Store.

## Prerequisites

### For iOS Development:
- macOS with Xcode installed (latest version recommended)
- Apple Developer Account ($99/year) for App Store submission
- CocoaPods (will be installed automatically when you open the iOS project)

### For Android Development:
- Android Studio installed
- Java Development Kit (JDK) 17 or higher
- Google Play Developer Account ($25 one-time fee) for Play Store submission

## Development Workflow

### 1. Build the Web App
```bash
npm run build
```

This builds the React app into the `dist` folder that Capacitor uses.

### 2. Sync to Native Platforms
```bash
npm run cap:sync
```

This command:
- Builds the web app
- Copies the built files to iOS and Android projects
- Updates native dependencies

### 3. Open in Native IDEs

**For iOS:**
```bash
npm run cap:ios
```
This opens the project in Xcode. From Xcode, you can:
- Run the app on a simulator
- Run on a physical iOS device
- Build for App Store submission

**For Android:**
```bash
npm run cap:android
```
This opens the project in Android Studio. From Android Studio, you can:
- Run the app on an emulator
- Run on a physical Android device
- Build APK or AAB for Play Store submission

## iOS App Store Deployment

### 1. Prepare for Submission

1. Open the project in Xcode:
   ```bash
   npm run cap:ios
   ```

2. Configure App Information:
   - Select the project in Xcode
   - Go to "Signing & Capabilities"
   - Select your Team (requires Apple Developer account)
   - Bundle Identifier: `com.wildfire.allergychecker`

3. Set App Version and Build Number:
   - In Xcode, select the project
   - Under "General" tab, set:
     - Version: (e.g., "1.0.0")
     - Build: (increment for each submission)

4. Add App Icons and Splash Screens:
   - Place icon files in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Recommended sizes: 1024x1024 for App Store, plus all required sizes
   - Splash screen configuration is in `ios/App/App/Base.lproj/`

### 2. Build for App Store

1. In Xcode:
   - Product → Destination → Any iOS Device (arm64)
   - Product → Archive
   - Once archived, the Organizer window opens

2. Validate and Upload:
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow the wizard to upload

### 3. Submit via App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Complete app information:
   - App name, subtitle, description
   - Screenshots (required for various device sizes)
   - Keywords, support URL
   - Privacy policy URL
3. Submit for Review

## Android Play Store Deployment

### 1. Prepare for Submission

1. Open the project in Android Studio:
   ```bash
   npm run cap:android
   ```

2. Configure Signing:
   - Build → Generate Signed Bundle / APK
   - Create a new keystore (save this securely!)
   - This is required for Play Store uploads

3. Set Version Information:
   - In `android/app/build.gradle`:
     ```gradle
     versionCode 1  // Increment for each update
     versionName "1.0.0"
     ```

4. Add App Icons:
   - Place icons in `android/app/src/main/res/mipmap-*/`
   - Required sizes: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi

### 2. Build Release Bundle

1. In Android Studio:
   - Build → Generate Signed Bundle / APK
   - Select "Android App Bundle" (recommended for Play Store)
   - Choose your keystore and enter password
   - Build variant: `release`
   - Output location will be shown

2. Or via command line:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   Output: `android/app/build/outputs/bundle/release/app-release.aab`

### 3. Upload to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app or select existing
3. Complete store listing:
   - App name, short description, full description
   - Screenshots (phone, tablet, TV if applicable)
   - Feature graphic (1024 x 500)
   - Privacy policy URL
4. Upload the AAB file
5. Complete content rating questionnaire
6. Submit for review

## App Configuration

### App ID
- **iOS**: `com.wildfire.allergychecker`
- **Android**: `com.wildfire.allergychecker`

### App Name
- **Display Name**: "Wildfire Allergy Checker"

### Version
- Update version in:
  - `package.json`
  - iOS: Xcode project settings
  - Android: `android/app/build.gradle`

## Important Notes

1. **Always sync after web changes:**
   ```bash
   npm run cap:sync
   ```

2. **Test on real devices** before submission

3. **App icons** are required in multiple sizes for both platforms

4. **Splash screens** can be configured in `capacitor.config.ts`

5. **Privacy Policy** is required for both app stores

6. **Keep your keystore secure** (Android) - losing it means you can't update the app

## Troubleshooting

### iOS Issues:
- **"No Podfile found"**: Run `cd ios/App && pod install`
- **Build errors**: Clean build folder (Product → Clean Build Folder)

### Android Issues:
- **Gradle sync errors**: Check Java version (need JDK 17+)
- **Build errors**: Clean project (Build → Clean Project)

### General:
- Always run `npm run cap:sync` after making web changes
- If plugins don't work, run `npm run cap:update`

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [Capacitor Community](https://forum.ionicframework.com/c/capacitor/)
