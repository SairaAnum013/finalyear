# Capacitor Integration Guide for CropGuard

This guide explains how to convert the CropGuard web app into an Android application using Capacitor.

## Prerequisites

- Node.js and npm installed
- Android Studio installed (for Android development)
- Java Development Kit (JDK) 11 or later

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Web App

```bash
npm run build
```

This creates the production build in the `dist` folder, which will be used by Capacitor.

### 3. Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
```

### 4. Initialize Capacitor

```bash
npx cap init
```

When prompted, use:
- **App name**: `CropGuard`
- **App ID**: `com.cropguard.app` (or your preferred bundle identifier)
- **Web asset directory**: `dist`

This creates a `capacitor.config.json` file in your project root.

### 5. Add Android Platform

```bash
npx cap add android
```

This creates an `android` folder with the native Android project.

### 6. Sync Web Assets to Native Project

```bash
npx cap sync
```

This copies your built web app into the native Android project.

### 7. Open Android Studio

```bash
npx cap open android
```

This opens your project in Android Studio where you can:
- Run the app on an emulator or physical device
- Configure app icons and splash screens
- Set permissions in `AndroidManifest.xml`
- Build APK or AAB files for distribution

## Important Configuration

### Capacitor Config

Your `capacitor.config.json` should look like:

```json
{
  "appId": "com.cropguard.app",
  "appName": "CropGuard",
  "webDir": "dist",
  "bundledWebRuntime": false
}
```

### Required Android Permissions

Add these permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Camera permission -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Gallery/Photos permission -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

<!-- Internet for API calls -->
<uses-permission android:name="android.permission.INTERNET" />
```

## Integrating Capacitor Plugins

### Camera and Photo Gallery

1. **Install Capacitor Camera Plugin**:
```bash
npm install @capacitor/camera
npx cap sync
```

2. **Update `imagePickerService.ts`**:

Replace the web-based file input implementation with Capacitor Camera API. See the comments in `src/services/imagePickerService.ts` for detailed instructions.

Example implementation:

```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// For taking photos
const image = await Camera.getPhoto({
  quality: 90,
  allowEditing: false,
  resultType: CameraResultType.Uri,
  source: CameraSource.Camera
});

// For picking from gallery
const image = await Camera.getPhoto({
  quality: 90,
  allowEditing: false,
  resultType: CameraResultType.Uri,
  source: CameraSource.Photos
});
```

### Disease Detection API

1. **Update `diseaseDetectionService.ts`**:

Replace the mock data with actual API calls. See comments in `src/services/diseaseDetectionService.ts`.

Set your API URL as an environment variable:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://your-api.com';

const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch(`${API_URL}/api/detect`, {
  method: 'POST',
  body: formData,
});

const data = await response.json();
```

2. **Update `.env` file**:

```env
VITE_API_URL=https://your-api-endpoint.com
```

## Development Workflow

### During Development

1. Make changes to your React code
2. Run `npm run build` to rebuild
3. Run `npx cap sync` to sync changes to native project
4. Run `npx cap open android` to test in Android Studio

### Quick Development Loop

For faster development, you can use live reload:

```bash
npm run dev
```

Then configure your Android app to point to your local development server:

```json
// capacitor.config.json
{
  "server": {
    "url": "http://192.168.1.XXX:5173",
    "cleartext": true
  }
}
```

Replace `192.168.1.XXX` with your computer's local IP address.

**Remember**: Remove the `server` configuration before building for production!

## Building for Production

### Debug APK

In Android Studio:
- Build → Build Bundle(s) / APK(s) → Build APK(s)

### Release APK/AAB (for Google Play)

1. Generate a signing key
2. Configure signing in Android Studio
3. Build → Generate Signed Bundle / APK
4. Choose AAB for Play Store submission

## Files to Modify for Full Capacitor Integration

| File | Purpose |
|------|---------|
| `src/services/imagePickerService.ts` | Replace file input with Capacitor Camera API |
| `src/services/diseaseDetectionService.ts` | Connect to real AI disease detection API |
| `src/services/authService.ts` | (Optional) Add biometric authentication |
| `src/services/historyService.ts` | (Optional) Add offline storage with Capacitor Storage |

## Additional Capacitor Plugins to Consider

- **@capacitor/storage**: For offline data persistence
- **@capacitor/network**: To detect online/offline status
- **@capacitor/geolocation**: If you want to track disease locations
- **@capacitor/share**: To share detection results
- **@capacitor/splash-screen**: For custom splash screen
- **@capacitor/status-bar**: For status bar styling

## Troubleshooting

### Issue: Images not loading in Android
- Make sure all image paths use relative URLs
- Use `import` for static assets in `src/assets/`

### Issue: API calls failing
- Check AndroidManifest.xml has INTERNET permission
- Verify your API URL is correct
- Use HTTPS URLs (not HTTP) in production

### Issue: Camera permission denied
- Ensure AndroidManifest.xml has CAMERA permission
- Request permissions at runtime using Capacitor Camera API

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor Camera Plugin](https://capacitorjs.com/docs/apis/camera)
- [Android Development](https://developer.android.com/)

---

**Ready to Deploy?**

After completing these steps, you'll have a fully functional Android app ready for Google Play Store submission!
