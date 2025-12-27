# Supabase URL Configuration for CropGuard Android App

This guide explains how to configure Supabase URLs, redirects, and deep linking so authentication and data storage work correctly in your Capacitor Android APK.

---

## Table of Contents

1. [Understanding URL Types](#understanding-url-types)
2. [Supabase Dashboard Configuration](#supabase-dashboard-configuration)
3. [Android Deep Linking Setup](#android-deep-linking-setup)
4. [Capacitor Configuration](#capacitor-configuration)
5. [Code Changes Required](#code-changes-required)
6. [Testing Authentication Flow](#testing-authentication-flow)
7. [Troubleshooting](#troubleshooting)

---

## Understanding URL Types

### 1. Site URL
- **What it is**: The main URL of your application
- **Web**: `https://yourapp.lovable.dev` or `https://yourdomain.com`
- **Mobile**: Your app's custom URL scheme: `app.lovable.cropguard://`

### 2. Redirect URLs
- **What they are**: URLs where Supabase redirects after authentication actions
- **Used for**: Login, signup, password reset, email confirmation
- **Mobile**: Must use your app's deep link scheme

### 3. Deep Links
- **What they are**: Special URLs that open your mobile app directly
- **Format**: `app.lovable.cropguard://path`
- **Example**: `app.lovable.cropguard://update-password`

---

## Supabase Dashboard Configuration

### Step 1: Access Lovable Cloud Backend

In Lovable, click on the backend settings to access your Supabase configuration.

### Step 2: Configure Site URL

Set the Site URL based on your primary platform:

```
For Web: https://your-project.lovable.dev
For Mobile: app.lovable.cropguard://
```

**Recommendation**: Keep web URL as Site URL, add mobile scheme to Redirect URLs.

### Step 3: Add Redirect URLs

Add ALL of these redirect URLs in Supabase Auth settings:

```
# Web URLs (for browser testing)
https://your-project.lovable.dev
https://your-project.lovable.dev/
https://your-project.lovable.dev/auth
https://your-project.lovable.dev/update-password
https://your-project.lovable.dev/login

# Mobile Deep Link URLs (for Android APK)
app.lovable.cropguard://
app.lovable.cropguard://auth
app.lovable.cropguard://login
app.lovable.cropguard://update-password
app.lovable.cropguard://dashboard

# Localhost (for development)
http://localhost:5173
http://localhost:5173/
http://localhost:5173/auth
http://localhost:5173/update-password
```

---

## Android Deep Linking Setup

### Step 1: Update AndroidManifest.xml

After running `npx cap add android`, edit:
`android/app/src/main/AndroidManifest.xml`

Add this inside the `<activity>` tag that has `android:name=".MainActivity"`:

```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:launchMode="singleTask"
    ...existing attributes...>

    <!-- Existing intent filter -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>

    <!-- ADD THIS: Deep Link Intent Filter -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <!-- Custom URL Scheme for your app -->
        <data android:scheme="app.lovable.cropguard" />
    </intent-filter>

    <!-- OPTIONAL: HTTPS Deep Links (App Links) -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data 
            android:scheme="https"
            android:host="your-project.lovable.dev" />
    </intent-filter>

</activity>
```

### Step 2: Full AndroidManifest.xml Example

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:theme="@style/AppTheme.NoActionBarLaunch">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep Link for Custom Scheme -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="app.lovable.cropguard" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

</manifest>
```

---

## Capacitor Configuration

### Step 1: Update capacitor.config.ts

Edit your `capacitor.config.ts` file in the project root:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.cropguard',
  appName: 'CropGuard',
  webDir: 'dist',
  
  // For development with live reload
  server: {
    url: 'https://your-project.lovable.dev?forceHideBadge=true',
    cleartext: true
  },
  
  // Deep linking configuration
  plugins: {
    App: {
      // Handle deep links
    }
  },
  
  android: {
    // Allow mixed content for development
    allowMixedContent: true
  }
};

export default config;
```

### Step 2: Install App Plugin

The @capacitor/app plugin handles deep links:

```bash
npm install @capacitor/app
npx cap sync
```

---

## Code Changes Required

### Step 1: Create Deep Link Handler

Create a new file: `src/hooks/useDeepLinks.ts`

```typescript
import { useEffect } from 'react';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

export const useDeepLinks = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) return;

    const handleDeepLink = (event: URLOpenListenerEvent) => {
      // Parse the URL
      const url = new URL(event.url);
      const path = url.pathname || url.host;
      
      console.log('Deep link received:', event.url);
      console.log('Navigating to:', path);

      // Handle different paths
      switch (path) {
        case 'update-password':
        case '/update-password':
          // Extract code from URL if present
          const code = url.searchParams.get('code');
          if (code) {
            navigate(`/update-password?code=${code}`);
          } else {
            navigate('/update-password');
          }
          break;
        
        case 'auth':
        case '/auth':
          navigate('/auth');
          break;
        
        case 'login':
        case '/login':
          navigate('/login');
          break;
        
        case 'dashboard':
        case '/dashboard':
          navigate('/dashboard');
          break;
        
        default:
          // Navigate to the path directly
          if (path && path !== '/') {
            navigate(`/${path.replace(/^\//, '')}`);
          }
      }
    };

    // Listen for deep link events
    App.addListener('appUrlOpen', handleDeepLink);

    // Check if app was opened via deep link
    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        handleDeepLink({ url: result.url });
      }
    });

    // Cleanup
    return () => {
      App.removeAllListeners();
    };
  }, [navigate]);
};
```

### Step 2: Update App.tsx

Add the deep link handler to your main App component:

```typescript
import { useDeepLinks } from './hooks/useDeepLinks';

function App() {
  // Add this hook inside the Router
  return (
    <BrowserRouter>
      <DeepLinkHandler />
      {/* ... rest of your app */}
    </BrowserRouter>
  );
}

// Create a separate component that uses the hook
function DeepLinkHandler() {
  useDeepLinks();
  return null;
}
```

### Step 3: Update Auth Redirect URLs

Update `src/services/authService.ts` to use correct redirect URLs:

```typescript
import { Capacitor } from '@capacitor/core';

// Helper to get the correct redirect URL
const getRedirectUrl = (path: string = '/') => {
  if (Capacitor.isNativePlatform()) {
    // Use custom URL scheme for mobile
    return `app.lovable.cropguard://${path.replace(/^\//, '')}`;
  }
  // Use window.location.origin for web
  return `${window.location.origin}${path}`;
};

// Update requestPasswordReset function
async requestPasswordReset(email: string): Promise<{ error?: string }> {
  try {
    const redirectUrl = getRedirectUrl('/update-password');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) throw error;
    return {};
  } catch (error: any) {
    return { error: error.message || "Failed to send reset email" };
  }
}

// Update signup function
async signup(email: string, password: string, name: string): Promise<AuthResponse> {
  try {
    const redirectUrl = getRedirectUrl('/');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: redirectUrl,
      },
    });

    // ... rest of signup logic
  } catch (error: any) {
    return { error: error.message || "Signup failed" };
  }
}
```

### Step 4: Update ForgotPassword.tsx

```typescript
import { Capacitor } from '@capacitor/core';

// In the handleSubmit function:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  // Get correct redirect URL
  const redirectUrl = Capacitor.isNativePlatform()
    ? 'app.lovable.cropguard://update-password'
    : `${window.location.origin}/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    setError(error.message);
  } else {
    setSuccess(true);
  }
  
  setLoading(false);
};
```

---

## Testing Authentication Flow

### Test 1: Password Reset Flow

1. **In the App**: Go to Login → Forgot Password
2. **Enter Email**: Submit your email address
3. **Check Email**: Open the password reset email
4. **Click Link**: The link should open your app (not browser)
5. **Update Password**: You should land on the Update Password page

### Test 2: Email Confirmation (Signup)

1. **Sign Up**: Create a new account
2. **Check Email**: Open the confirmation email
3. **Click Link**: Should open your app
4. **Logged In**: You should be authenticated

### Test 3: Deep Link Testing with ADB

Test deep links using Android Debug Bridge:

```bash
# Test opening the app
adb shell am start -a android.intent.action.VIEW \
  -d "app.lovable.cropguard://dashboard" \
  app.lovable.cropguard

# Test password reset deep link
adb shell am start -a android.intent.action.VIEW \
  -d "app.lovable.cropguard://update-password?code=abc123" \
  app.lovable.cropguard
```

---

## How Data Storage Works

### Supabase Connection in Mobile App

1. **Same API**: The mobile app uses the same Supabase URL and keys
2. **Authentication**: Works the same, tokens stored in app storage
3. **Database Queries**: Identical to web version
4. **RLS Policies**: Same Row Level Security applies

### Data Flow

```
Mobile App (APK)
    ↓
Supabase Client (same as web)
    ↓
Supabase API (https://your-project.supabase.co)
    ↓
PostgreSQL Database
```

### Session Persistence

In mobile apps, authentication sessions are stored in:
- **Web/PWA**: localStorage
- **Capacitor Android**: WebView's localStorage (persisted)

The session automatically refreshes as configured in the Supabase client.

---

## Troubleshooting

### Issue: Deep links open in browser instead of app

**Solution**: 
1. Verify `android:launchMode="singleTask"` in MainActivity
2. Check intent-filter is correct in AndroidManifest.xml
3. Rebuild: `npx cap sync && npx cap build android`

### Issue: "requested path is invalid" error

**Solution**:
1. Add all redirect URLs in Supabase Auth settings
2. Make sure custom scheme is in the list: `app.lovable.cropguard://`

### Issue: Password reset email links not working

**Solution**:
1. Check redirectTo URL matches Supabase settings
2. Verify deep link handler is registered
3. Test with ADB command first

### Issue: Session not persisting after app restart

**Solution**:
1. Ensure `persistSession: true` in Supabase client config
2. Check WebView is not clearing data on close

### Issue: Auth callback not received

**Solution**:
1. Verify onAuthStateChange listener is set up
2. Check if app is receiving the deep link event
3. Add console.log in deep link handler to debug

---

## Quick Reference

### URLs to Configure in Supabase

| URL Type | Value |
|----------|-------|
| Site URL | `https://your-project.lovable.dev` |
| Redirect URL 1 | `app.lovable.cropguard://` |
| Redirect URL 2 | `app.lovable.cropguard://update-password` |
| Redirect URL 3 | `app.lovable.cropguard://auth` |
| Redirect URL 4 | `https://your-project.lovable.dev/update-password` |

### Files to Modify

| File | Changes |
|------|---------|
| `android/app/src/main/AndroidManifest.xml` | Add deep link intent filters |
| `capacitor.config.ts` | Configure app scheme |
| `src/hooks/useDeepLinks.ts` | Create deep link handler |
| `src/App.tsx` | Add deep link handler component |
| `src/services/authService.ts` | Update redirect URLs |

### Deep Link Format

```
app.lovable.cropguard://[path]?[query_params]

Examples:
- app.lovable.cropguard://
- app.lovable.cropguard://dashboard
- app.lovable.cropguard://update-password?code=abc123
- app.lovable.cropguard://auth
```

---

## Summary Checklist

- [ ] Added all redirect URLs in Supabase Auth settings
- [ ] Updated AndroidManifest.xml with intent filters
- [ ] Set `android:launchMode="singleTask"` on MainActivity
- [ ] Installed @capacitor/app plugin
- [ ] Created useDeepLinks.ts hook
- [ ] Added DeepLinkHandler to App.tsx
- [ ] Updated authService.ts with platform-aware redirects
- [ ] Tested password reset flow on device
- [ ] Tested signup email confirmation on device
- [ ] Verified data is saving to Supabase correctly

---

## Need Help?

If deep links aren't working:
1. Run `adb logcat | grep -i "cropguard"` to see app logs
2. Check if the URL scheme matches exactly
3. Ensure you ran `npx cap sync` after changes
4. Rebuild the APK completely with `npx cap build android`
