# Running on iPad Simulator

## Quick Steps

1. **Xcode should now be open** with the project loaded

2. **Select iPad Simulator:**
   - At the top of Xcode, click the device selector (next to the Play button)
   - Type "iPad" to filter
   - Select any iPad simulator (e.g., "iPad Pro (12.9-inch)", "iPad Air", or "iPad (10th generation)")
   - Recommended: **iPad Pro (12.9-inch)** for best testing experience

3. **Run the App:**
   - Click the **Play button** (▶️) in the top-left corner, or press **⌘ + R**
   - Xcode will build and launch the iPad simulator
   - The app will open as a native iOS app (NOT in a browser tab)

## If iPad Simulators Aren't Available

If you don't see iPad simulators in the list:

1. In Xcode: **Settings** → **Platforms** (or **Components** in older Xcode)
2. Find **iOS** and click **Get** next to the latest iOS version
3. This will download the simulator runtimes which include iPad simulators
4. Wait for download to complete
5. The iPad simulators will appear in the device selector

## Verify It's Running as Native App (Not Browser)

When running on the iPad simulator, you should see:
- ✅ Full-screen app experience
- ✅ iOS status bar at the top
- ✅ Native iOS app feel (no browser chrome/address bar)
- ✅ Can use iOS gestures (pinch, swipe, etc.)
- ✅ Runs in the Simulator app (separate from Safari)

If you see Safari or a browser tab, you're not running the native app - make sure you're using Xcode's Run button, not opening in a browser.

## Supported iPad Devices

The app is configured to run on all iPad simulators:
- iPad (10th generation)
- iPad Air
- iPad Pro (all sizes)
- iPad mini

## Troubleshooting

### "No simulators available"
- Install iOS simulators: Xcode → Settings → Platforms

### Build errors
- Clean build folder: **Product** → **Clean Build Folder** (⇧⌘K)
- Try again

### App doesn't launch
- Check that signing is configured: **Signing & Capabilities** tab
- Use **Automatic** signing if you have an Apple Developer account

### Want to test on physical iPad?
- Connect iPad via USB
- Trust the computer on the iPad
- Select your iPad in Xcode's device selector
- Run the app (may need to configure code signing first)
