import { supabase } from "@/integrations/supabase/client";

/**
 * Storage Service
 * 
 * Service for handling file uploads to cloud storage.
 * Currently set up for Supabase Storage with the 'leaf-images' bucket.
 * 
 * FUTURE CAPACITOR INTEGRATION:
 * When building the Android app with Capacitor, you can enhance this service to:
 * 1. Use Capacitor Filesystem API to handle local file caching
 * 2. Optimize images before upload using Capacitor plugins
 * 3. Implement offline queue for uploads when device is offline
 * 
 * USAGE:
 * Before using this service, you need to create the storage bucket:
 * 1. Go to your backend dashboard
 * 2. Navigate to Storage section
 * 3. Create a new bucket named 'leaf-images'
 * 4. Set appropriate access policies (public read if you want images to be viewable)
 * 
 * Or run this SQL migration:
 * 
 * ```sql
 * -- Create the leaf-images bucket
 * INSERT INTO storage.buckets (id, name, public)
 * VALUES ('leaf-images', 'leaf-images', true);
 * 
 * -- Create RLS policies for the bucket
 * CREATE POLICY "Anyone can view leaf images"
 * ON storage.objects FOR SELECT
 * USING (bucket_id = 'leaf-images');
 * 
 * CREATE POLICY "Authenticated users can upload leaf images"
 * ON storage.objects FOR INSERT
 * WITH CHECK (
 *   bucket_id = 'leaf-images' AND
 *   auth.role() = 'authenticated'
 * );
 * 
 * CREATE POLICY "Users can update their own leaf images"
 * ON storage.objects FOR UPDATE
 * USING (
 *   bucket_id = 'leaf-images' AND
 *   auth.uid()::text = (storage.foldername(name))[1]
 * );
 * 
 * CREATE POLICY "Users can delete their own leaf images"
 * ON storage.objects FOR DELETE
 * USING (
 *   bucket_id = 'leaf-images' AND
 *   auth.uid()::text = (storage.foldername(name))[1]
 * );
 * ```
 */
export const storageService = {
  /**
   * Upload a leaf image to storage
   * 
   * @param file - The image file to upload
   * @param userId - Optional user ID to organize files by user
   * @returns Object with imageUrl on success, or error on failure
   * 
   * @example
   * ```typescript
   * const result = await storageService.uploadLeafImage(imageFile, user.id);
   * if (result.imageUrl) {
   *   console.log('Image uploaded:', result.imageUrl);
   * } else {
   *   console.error('Upload failed:', result.error);
   * }
   * ```
   */
  async uploadLeafImage(
    file: File,
    userId?: string
  ): Promise<{ imageUrl?: string; error?: string }> {
    try {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}.${fileExt}`;
      
      // Organize by user if userId provided
      const filePath = userId 
        ? `${userId}/${fileName}`
        : `guest/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('leaf-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('leaf-images')
        .getPublicUrl(filePath);

      return { imageUrl: publicUrl };
    } catch (error: any) {
      console.error('Upload error:', error);
      return { 
        error: error.message || 'Failed to upload image'
      };
    }
  },

  /**
   * Delete an image from storage
   * 
   * @param imageUrl - The full URL of the image to delete
   * @returns Success status
   */
  async deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('leaf-images') + 1).join('/');

      const { error } = await supabase.storage
        .from('leaf-images')
        .remove([filePath]);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Delete error:', error);
      return { 
        success: false,
        error: error.message || 'Failed to delete image'
      };
    }
  },

  /**
   * Get all images for a user
   * 
   * @param userId - User ID to fetch images for
   * @returns Array of image URLs
   */
  async getUserImages(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from('leaf-images')
        .list(userId, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      // Get public URLs for all files
      const urls = (data || []).map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('leaf-images')
          .getPublicUrl(`${userId}/${file.name}`);
        return publicUrl;
      });

      return urls;
    } catch (error) {
      console.error('Failed to fetch images:', error);
      return [];
    }
  },
};
