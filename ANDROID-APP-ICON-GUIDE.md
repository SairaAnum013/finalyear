# Android App Icon Setup Guide for CropGuard

This guide explains how to set up your custom app icon for the CropGuard Android application after converting with Capacitor.

## Prerequisites

- Capacitor project already set up (`npx cap add android` completed)
- Your logo image (app-icon.jpg is now in public/ folder)
- Android Studio installed

---

## Step 1: Prepare Icon Sizes

Android requires multiple icon sizes for different screen densities. You need to create the following sizes from your logo:

| Folder | Icon Size | Use Case |
|--------|-----------|----------|
| mipmap-mdpi | 48x48 px | Medium density |
| mipmap-hdpi | 72x72 px | High density |
| mipmap-xhdpi | 96x96 px | Extra high density |
| mipmap-xxhdpi | 144x144 px | Extra extra high density |
| mipmap-xxxhdpi | 192x192 px | Extra extra extra high density |

### Easy Method: Use Android Studio's Image Asset Studio

1. Open your project in Android Studio: `npx cap open android`
2. Right-click on `app/src/main/res` folder
3. Select **New → Image Asset**
4. This opens the **Image Asset Studio**

---

## Step 2: Using Image Asset Studio

### Configure Launcher Icon:

1. **Icon Type**: Select "Launcher Icons (Adaptive and Legacy)"

2. **Name**: Keep as `ic_launcher` (default)

3. **Foreground Layer**:
   - **Source Asset → Asset Type**: Select "Image"
   - **Path**: Browse and select your logo image (`public/app-icon.jpg` from your project)
   - **Trim**: Check "Yes" to remove whitespace
   - **Resize**: Adjust to about 60-70% so the icon has proper padding

4. **Background Layer**:
   - **Source Asset → Asset Type**: Select "Color"
   - **Color**: Choose white (`#FFFFFF`) or your preferred background color

5. **Options**:
   - **Shape**: Choose "Circle" or "Square" based on preference
   - Check "Generate Round Icon" for devices that use round icons

6. Click **Next**, then **Finish**

---

## Step 3: Manual Method (Alternative)

If you prefer manual setup, resize your logo to each required size and place them in:

```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png (48x48)
│   └── ic_launcher_round.png (48x48)
├── mipmap-hdpi/
│   ├── ic_launcher.png (72x72)
│   └── ic_launcher_round.png (72x72)
├── mipmap-xhdpi/
│   ├── ic_launcher.png (96x96)
│   └── ic_launcher_round.png (96x96)
├── mipmap-xxhdpi/
│   ├── ic_launcher.png (144x144)
│   └── ic_launcher_round.png (144x144)
└── mipmap-xxxhdpi/
    ├── ic_launcher.png (192x192)
    └── ic_launcher_round.png (192x192)
```

### Tools for Resizing:
- **Online**: [AppIcon.co](https://appicon.co/) - Upload once, download all sizes
- **Online**: [MakeAppIcon](https://makeappicon.com/)
- **Desktop**: Photoshop, GIMP, or any image editor

---

## Step 4: Verify AndroidManifest.xml

Ensure your `android/app/src/main/AndroidManifest.xml` references the correct icon:

```xml
<application
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:label="@string/app_name"
    ...>
```

This should already be set by default, but verify it's correct.

---

## Step 5: Update App Name (Optional)

To change the app name displayed under the icon, edit:

**File**: `android/app/src/main/res/values/strings.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">CropGuard</string>
    <string name="title_activity_main">CropGuard</string>
    <string name="package_name">app.lovable.d19f48823fc449969f7aa233f5193ba7</string>
    <string name="custom_url_scheme">app.lovable.d19f48823fc449969f7aa233f5193ba7</string>
</resources>
```

---

## Step 6: Adaptive Icons (Android 8.0+)

For modern Android devices, create adaptive icons:

### Create Foreground Drawable

**File**: `android/app/src/main/res/drawable/ic_launcher_foreground.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

### Create Background Color

**File**: `android/app/src/main/res/values/colors.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
```

---

## Step 7: Splash Screen Icon (Optional)

To use the same icon for the splash screen:

**File**: `android/app/src/main/res/drawable/splash.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/ic_launcher_background"/>
    <item
        android:drawable="@mipmap/ic_launcher"
        android:gravity="center"
        android:width="176dp"
        android:height="176dp"/>
</layer-list>
```

---

## Step 8: Build and Test

After setting up icons:

```bash
# Sync changes
npx cap sync android

# Build debug APK
cd android
./gradlew assembleDebug

# Or open in Android Studio and run
npx cap open android
```

### Verify Icon:
1. Install the APK on your device/emulator
2. Check the app drawer for your new icon
3. Check the recent apps screen
4. Check the settings → apps list

---

## Troubleshooting

### Icon Not Updating
1. Uninstall the old app completely from device
2. Clean build: `cd android && ./gradlew clean`
3. Rebuild: `./gradlew assembleDebug`
4. Reinstall

### Icon Looks Blurry
- Ensure you're using high-resolution source image (at least 512x512)
- Use PNG format for best quality
- Avoid JPEG compression artifacts

### Icon Has Wrong Background
- For adaptive icons, check the `ic_launcher_background` color value
- Ensure foreground image has transparent background

### Icon Not Showing on Some Devices
- Make sure you've created both regular and round icon versions
- Verify all mipmap density folders have icons

---

## Quick Reference: File Locations

```
android/app/src/main/
├── res/
│   ├── mipmap-mdpi/
│   │   ├── ic_launcher.png
│   │   └── ic_launcher_round.png
│   ├── mipmap-hdpi/
│   │   ├── ic_launcher.png
│   │   └── ic_launcher_round.png
│   ├── mipmap-xhdpi/
│   │   ├── ic_launcher.png
│   │   └── ic_launcher_round.png
│   ├── mipmap-xxhdpi/
│   │   ├── ic_launcher.png
│   │   └── ic_launcher_round.png
│   ├── mipmap-xxxhdpi/
│   │   ├── ic_launcher.png
│   │   └── ic_launcher_round.png
│   ├── values/
│   │   ├── colors.xml
│   │   └── strings.xml
│   └── drawable/
│       └── splash.xml
└── AndroidManifest.xml
```

---

## Summary Checklist

- [ ] Prepare logo image (minimum 512x512 px, PNG preferred)
- [ ] Open Android Studio: `npx cap open android`
- [ ] Use Image Asset Studio (Right-click res → New → Image Asset)
- [ ] Generate all icon sizes
- [ ] Verify AndroidManifest.xml references
- [ ] Update app name in strings.xml (optional)
- [ ] Sync: `npx cap sync android`
- [ ] Build and test APK
- [ ] Verify icon on device/emulator

Your CropGuard app will now display your custom logo as the app icon!
