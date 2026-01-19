# Wildfire Allergy Safety Checker

An internal web tool and mobile app for restaurant managers to check allergy safety for menu items.

Available as:
- 🌐 **Web Application** - Accessible via browser
- 📱 **iOS App** - Available in the App Store
- 🤖 **Android App** - Available in Google Play Store

## Setup

1. Install dependencies:
```bash
npm install
```

2. Generate menu data from CSV:
```bash
npm run generate-menu-data
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown (typically `http://localhost:5173`)

## Usage

1. Select a dish from the dropdown (you can search by name, ticket code, or category)
2. Select one or more allergies using the checkboxes
3. Click "Check Safety" to see the results

The tool will show:
- ✅ Safe as-is
- ⚠️ Safe ONLY with modifications (and show those modifications)
- ⛔ NOT safe / should not be served

## Building for Production

### Web Build
```bash
npm run build
```

The built files will be in the `dist` directory.

### Mobile App Development

This app uses Capacitor to build native iOS and Android apps. See [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md) for detailed instructions.

**Quick Start for Mobile:**
```bash
# Build and sync to mobile platforms
npm run cap:sync

# Open in native IDEs
npm run cap:ios      # Opens in Xcode
npm run cap:android  # Opens in Android Studio
```

For complete mobile deployment instructions, see [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md).

## Important Notes

- This tool is based on the ingredient book data
- For severe allergies, ALWAYS confirm with the chef/manager
- Follow full allergy protocol regardless of tool results



