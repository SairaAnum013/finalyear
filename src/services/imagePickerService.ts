/**
 * Image Picker Service
 * 
 * CURRENT IMPLEMENTATION: Web-based file input
 * 
 * FOR CAPACITOR ANDROID APP:
 * Replace this with Capacitor Camera and Filesystem plugins:
 * 
 * 1. Install plugins:
 *    npm install @capacitor/camera @capacitor/filesystem
 * 
 * 2. Import:
 *    import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
 * 
 * 3. Replace takePhoto() with:
 *    const image = await Camera.getPhoto({
 *      quality: 90,
 *      allowEditing: false,
 *      resultType: CameraResultType.Uri,
 *      source: CameraSource.Camera
 *    });
 *    return convertUriToFile(image.webPath);
 * 
 * 4. Replace pickFromGallery() with:
 *    const image = await Camera.getPhoto({
 *      quality: 90,
 *      allowEditing: false,
 *      resultType: CameraResultType.Uri,
 *      source: CameraSource.Photos
 *    });
 *    return convertUriToFile(image.webPath);
 */

export interface ImagePickerResult {
  file: File;
  preview: string;
}

export const imagePickerService = {
  /**
   * Request camera permission
   * 
   * FOR CAPACITOR: Use Camera.checkPermissions() and Camera.requestPermissions()
   */
  async requestCameraPermission(): Promise<boolean> {
    // On web, permission is handled by the browser when accessing camera
    // For Capacitor, replace with:
    // const permission = await Camera.checkPermissions();
    // if (permission.camera !== 'granted') {
    //   const request = await Camera.requestPermissions();
    //   return request.camera === 'granted';
    // }
    return true;
  },

  /**
   * Request gallery/photos permission
   * 
   * FOR CAPACITOR: Use Camera.checkPermissions() and Camera.requestPermissions()
   */
  async requestGalleryPermission(): Promise<boolean> {
    // On web, permission is handled by the browser when accessing files
    // For Capacitor, replace with:
    // const permission = await Camera.checkPermissions();
    // if (permission.photos !== 'granted') {
    //   const request = await Camera.requestPermissions();
    //   return request.photos === 'granted';
    // }
    return true;
  },

  /**
   * Take photo using camera
   * 
   * WEB IMPLEMENTATION: Triggers file input with camera capture
   * CAPACITOR: Replace with Camera.getPhoto() using CameraSource.Camera
   */
  async takePhoto(): Promise<ImagePickerResult | null> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment"; // Use back camera on mobile

      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const preview = URL.createObjectURL(file);
          resolve({ file, preview });
        } else {
          resolve(null);
        }
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  },

  /**
   * Pick image from gallery
   * 
   * WEB IMPLEMENTATION: Triggers file input
   * CAPACITOR: Replace with Camera.getPhoto() using CameraSource.Photos
   */
  async pickFromGallery(): Promise<ImagePickerResult | null> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const preview = URL.createObjectURL(file);
          resolve({ file, preview });
        } else {
          resolve(null);
        }
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  }
};
