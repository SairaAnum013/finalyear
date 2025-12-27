# Backend Setup Guide (Supabase Integration)

This guide explains how CropGuard integrates with Supabase for authentication, database storage, and file management.

## Overview

CropGuard uses **Lovable Cloud**, which is powered by Supabase, providing:
- **Authentication**: User signup, login, and session management
- **Database**: PostgreSQL database for storing user profiles and detection history
- **Storage**: File storage for maize leaf images (optional, ready for future use)

## Environment Variables

The following environment variables are **automatically configured** by Lovable Cloud. You don't need to set them manually:

```env
VITE_SUPABASE_URL=https://pejsxdkdvmsoocsplrcd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=pejsxdkdvmsoocsplrcd
```

These are used in:
- `src/integrations/supabase/client.ts` - Supabase client initialization
- `src/services/authService.ts` - Authentication operations
- `src/services/historyService.ts` - Detection history storage
- `src/services/storageService.ts` - Image uploads (future use)

## Database Schema

### 1. **profiles** table

Stores additional user profile information beyond basic auth data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated unique identifier |
| `user_id` | UUID | References auth.users.id |
| `full_name` | TEXT | User's full name (nullable) |
| `phone` | TEXT | Phone number (nullable) |
| `avatar_url` | TEXT | Profile picture URL (nullable) |
| `created_at` | TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | Last profile update time |

**Used in:**
- `src/services/authService.ts` - Creates profile on signup via database trigger
- `src/pages/Profile.tsx` - Displays and updates user profile data

**Row-Level Security (RLS):**
- Users can only view, insert, and update their own profile
- Profiles are automatically created when a user signs up (via trigger)

### 2. **detections** table

Stores maize disease detection results and history.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated unique identifier |
| `user_id` | UUID | References user who made the detection |
| `disease_name` | TEXT | Detected disease name |
| `confidence_level` | NUMERIC | Detection confidence (0-100) |
| `severity` | TEXT | Disease severity (Mild/Moderate/Severe) |
| `image_url` | TEXT | URL to the uploaded leaf image |
| `recommendations` | TEXT | Treatment suggestions (formatted text) |
| `detected_at` | TIMESTAMP | When detection was performed |

**Used in:**
- `src/services/historyService.ts` - Saves and retrieves detection history
- `src/pages/History.tsx` - Displays past detections
- `src/pages/DetectDisease.tsx` - Saves new detections

**Row-Level Security (RLS):**
- Users can only view, insert, and delete their own detections
- Guest users cannot save detections (no user_id)

### 3. **leaf-images** storage bucket (Optional - Not yet created)

Will store uploaded maize leaf images. To enable:

1. **Create the bucket:**
   Navigate to your backend dashboard → Storage → Create new bucket → Name: `leaf-images`

2. **Or run this SQL migration:**
   ```sql
   -- Create the leaf-images bucket
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('leaf-images', 'leaf-images', true);
   
   -- Create RLS policies
   CREATE POLICY "Anyone can view leaf images"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'leaf-images');
   
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'leaf-images' AND
     auth.role() = 'authenticated'
   );
   
   CREATE POLICY "Users can manage their own images"
   ON storage.objects FOR UPDATE, DELETE
   USING (
     bucket_id = 'leaf-images' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

3. **Update detection service to use storage:**
   In `src/services/diseaseDetectionService.ts`, uncomment the storage integration code and use `storageService.uploadLeafImage()` before detecting.

**Used in:**
- `src/services/storageService.ts` - Upload/delete/list leaf images
- Future: `src/pages/DetectDisease.tsx` - Upload images before detection

## Authentication Flow

### Signup
1. User enters name, email, password on `/signup`
2. `authService.signup()` calls `supabase.auth.signUp()`
3. Database trigger automatically creates profile record
4. User is redirected to `/detect`

### Login
1. User enters email, password on `/login`
2. `authService.login()` calls `supabase.auth.signInWithPassword()`
3. Session is established and persisted
4. User is redirected to `/detect`

### Session Management
- `src/contexts/AuthContext.tsx` manages global auth state
- Uses `supabase.auth.onAuthStateChange()` to listen for auth events
- Session persists across page refreshes (stored in localStorage)

### Logout
1. User clicks logout button
2. `authService.logout()` calls `supabase.auth.signOut()`
3. Session is cleared
4. User is redirected to `/`

## Viewing Your Data

### Option 1: Lovable Cloud Dashboard (Recommended)

Access your backend dashboard to view and manage data:
- **Users**: View registered users, reset passwords, manage sessions
- **Tables**: Browse, edit, and query data in `profiles` and `detections` tables
- **Storage**: View uploaded images in the `leaf-images` bucket
- **Logs**: Monitor API requests, errors, and performance

### Option 2: Direct SQL Queries

You can query your database using SQL. Some useful queries:

```sql
-- View all user profiles
SELECT * FROM profiles ORDER BY created_at DESC;

-- View all detections with user info
SELECT 
  d.id,
  p.full_name,
  d.disease_name,
  d.confidence_level,
  d.severity,
  d.detected_at
FROM detections d
JOIN profiles p ON d.user_id = p.user_id
ORDER BY d.detected_at DESC;

-- Get detection statistics by user
SELECT 
  p.full_name,
  COUNT(d.id) as total_detections,
  AVG(d.confidence_level) as avg_confidence
FROM profiles p
LEFT JOIN detections d ON p.user_id = d.user_id
GROUP BY p.id, p.full_name;

-- Find all severe disease detections
SELECT * FROM detections 
WHERE severity = 'Severe' 
ORDER BY detected_at DESC;
```

## Development Workflow

### Running the Project

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing Authentication

1. **Auto-confirm emails** is enabled by default in development
   - Users can sign in immediately without email confirmation
   - To disable: Backend Dashboard → Auth Settings → Toggle "Enable email confirmations"

2. **Test user accounts:**
   - Create test accounts via `/signup`
   - View users in Backend Dashboard → Authentication → Users

3. **Test guest mode:**
   - Visit `/detect` without logging in
   - Detections won't be saved but functionality works

### Verifying Data Storage

After making a detection as a logged-in user:

1. **Check the database:**
   - Go to Backend Dashboard → Table Editor → `detections`
   - Verify new row was created with correct user_id

2. **Check the History page:**
   - Navigate to `/history` while logged in
   - Confirm detection appears in the list

3. **Check user profile:**
   - Navigate to `/profile`
   - Verify profile data loads correctly
   - Test editing name and phone number

## Important Notes

### Auto-Generated Files (DO NOT EDIT)

These files are automatically managed and should **never** be edited manually:
- `.env` - Environment variables
- `src/integrations/supabase/client.ts` - Supabase client
- `src/integrations/supabase/types.ts` - TypeScript types from database schema
- `supabase/config.toml` - Supabase configuration

If you need to modify database schema or authentication settings, use the Backend Dashboard or SQL migrations.

### Guest Mode

- Guest users (not logged in) can use the detection feature
- Results are not saved to the database
- A banner prompts them to sign in to save history

### Security

- **Row-Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Authentication tokens are stored securely in localStorage
- All API requests include authentication headers automatically

## Future Enhancements

### When Building Android App with Capacitor

1. **Enable image storage:**
   - Create the `leaf-images` bucket (see section above)
   - Update `diseaseDetectionService.ts` to upload images before detection
   - Store image URLs in `detections.image_url` column

2. **Integrate Capacitor Camera:**
   - Install `@capacitor/camera` plugin
   - Update `src/services/imagePickerService.ts` to use native camera
   - Replace web file input with `Camera.getPhoto()`

3. **Optimize for mobile:**
   - Implement image compression before upload
   - Add offline detection queue
   - Cache recent detections locally

### Real AI Disease Detection

Currently, `diseaseDetectionService.ts` returns mock data. To connect a real AI model:

1. **Option A: Use an API service**
   ```typescript
   // In diseaseDetectionService.ts
   async detectDisease(imageFile: File): Promise<DetectionResult> {
     const formData = new FormData();
     formData.append('image', imageFile);
     
     const response = await fetch('YOUR_AI_API_ENDPOINT', {
       method: 'POST',
       body: formData,
     });
     
     const result = await response.json();
     return transformToDetectionResult(result);
   }
   ```

2. **Option B: Deploy your own model**
   - Use TensorFlow.js for client-side detection
   - Or deploy a Python model and call it via API

## Support

If you encounter issues:
1. Check Backend Dashboard → Logs for error details
2. Verify RLS policies are correctly configured
3. Ensure user is authenticated when required
4. Check browser console for client-side errors

For database schema changes:
- Use SQL migrations through Backend Dashboard
- Types will auto-regenerate in `src/integrations/supabase/types.ts`
