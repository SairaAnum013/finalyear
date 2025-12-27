# Complete TFLite Model Integration Guide for CropGuard

This guide explains how to integrate your TensorFlow Lite (.tflite) model for real disease detection in the CropGuard Android app.

---

## PART 1: CAPACITOR SETUP (Do This First)

### Prerequisites
- Node.js and npm installed
- Android Studio installed
- Java Development Kit (JDK) 11 or later

### Step-by-Step Setup

```bash
# 1. Install dependencies
npm install

# 2. Build the web app
npm run build

# 3. Install Capacitor
npm install @capacitor/core @capacitor/cli

# 4. Initialize Capacitor
npx cap init
# Use these values when prompted:
# - App name: CropGuard
# - App ID: com.cropguard.app
# - Web asset directory: dist

# 5. Add Android platform
npx cap add android

# 6. Sync web assets
npx cap sync

# 7. Open in Android Studio
npx cap open android
```

---

## PART 2: ADD YOUR TFLITE MODEL FILES

### Where to Place Model Files

After running `npx cap add android`, place your model files here:

```
android/app/src/main/assets/
├── maize_disease_model.tflite    ← Your TFLite model
└── labels.txt                     ← Your labels file
```

**If the `assets` folder doesn't exist, create it:**
```bash
mkdir -p android/app/src/main/assets
```

### Labels File Format

Your `labels.txt` should have one disease name per line:
```
Healthy
Northern Corn Leaf Blight
Common Rust
Gray Leaf Spot
Cercospora Leaf Spot
```

---

## PART 3: ADD TENSORFLOW LITE DEPENDENCY

### Update `android/app/build.gradle`

Add this inside the `dependencies { }` block:

```gradle
dependencies {
    // ... existing dependencies ...
    
    // TensorFlow Lite
    implementation 'org.tensorflow:tensorflow-lite:2.14.0'
    implementation 'org.tensorflow:tensorflow-lite-support:0.4.4'
}
```

Also add this inside `android { }` block to prevent compression of tflite files:

```gradle
android {
    // ... existing config ...
    
    aaptOptions {
        noCompress "tflite"
    }
}
```

---

## PART 4: CREATE NATIVE TFLITE PLUGIN

### File 1: Create Plugin Interface

Create file: `android/app/src/main/java/com/cropguard/app/TFLitePlugin.java`

```java
package com.cropguard.app;

import android.content.res.AssetFileDescriptor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.tensorflow.lite.Interpreter;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "TFLite")
public class TFLitePlugin extends Plugin {
    
    private Interpreter interpreter;
    private List<String> labels;
    private static final int IMAGE_SIZE = 224; // Adjust based on your model
    private static final int NUM_CLASSES = 5;  // Adjust based on your labels
    
    @Override
    public void load() {
        try {
            // Load model
            MappedByteBuffer modelBuffer = loadModelFile("maize_disease_model.tflite");
            interpreter = new Interpreter(modelBuffer);
            
            // Load labels
            labels = loadLabels("labels.txt");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    private MappedByteBuffer loadModelFile(String modelPath) throws IOException {
        AssetFileDescriptor fileDescriptor = getContext().getAssets().openFd(modelPath);
        FileInputStream inputStream = new FileInputStream(fileDescriptor.getFileDescriptor());
        FileChannel fileChannel = inputStream.getChannel();
        long startOffset = fileDescriptor.getStartOffset();
        long declaredLength = fileDescriptor.getDeclaredLength();
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength);
    }
    
    private List<String> loadLabels(String labelPath) throws IOException {
        List<String> labels = new ArrayList<>();
        BufferedReader reader = new BufferedReader(
            new InputStreamReader(getContext().getAssets().open(labelPath))
        );
        String line;
        while ((line = reader.readLine()) != null) {
            labels.add(line);
        }
        reader.close();
        return labels;
    }
    
    @PluginMethod
    public void detectDisease(PluginCall call) {
        String base64Image = call.getString("imageBase64");
        
        if (base64Image == null) {
            call.reject("No image provided");
            return;
        }
        
        try {
            // Remove data URL prefix if present
            if (base64Image.contains(",")) {
                base64Image = base64Image.split(",")[1];
            }
            
            // Decode base64 to bitmap
            byte[] imageBytes = Base64.decode(base64Image, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);
            
            // Resize to model input size
            Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, IMAGE_SIZE, IMAGE_SIZE, true);
            
            // Convert to ByteBuffer
            ByteBuffer inputBuffer = convertBitmapToByteBuffer(resizedBitmap);
            
            // Run inference
            float[][] output = new float[1][NUM_CLASSES];
            interpreter.run(inputBuffer, output);
            
            // Find the best prediction
            int maxIndex = 0;
            float maxConfidence = output[0][0];
            for (int i = 1; i < NUM_CLASSES; i++) {
                if (output[0][i] > maxConfidence) {
                    maxConfidence = output[0][i];
                    maxIndex = i;
                }
            }
            
            // Build response
            JSObject result = new JSObject();
            result.put("diseaseName", labels.get(maxIndex));
            result.put("confidence", Math.round(maxConfidence * 100));
            result.put("allPredictions", buildPredictionsArray(output[0]));
            
            call.resolve(result);
            
        } catch (Exception e) {
            call.reject("Detection failed: " + e.getMessage());
        }
    }
    
    private ByteBuffer convertBitmapToByteBuffer(Bitmap bitmap) {
        ByteBuffer byteBuffer = ByteBuffer.allocateDirect(4 * IMAGE_SIZE * IMAGE_SIZE * 3);
        byteBuffer.order(ByteOrder.nativeOrder());
        
        int[] pixels = new int[IMAGE_SIZE * IMAGE_SIZE];
        bitmap.getPixels(pixels, 0, bitmap.getWidth(), 0, 0, bitmap.getWidth(), bitmap.getHeight());
        
        for (int pixel : pixels) {
            // Normalize pixel values to [0, 1] or [-1, 1] based on your model
            float r = ((pixel >> 16) & 0xFF) / 255.0f;
            float g = ((pixel >> 8) & 0xFF) / 255.0f;
            float b = (pixel & 0xFF) / 255.0f;
            
            byteBuffer.putFloat(r);
            byteBuffer.putFloat(g);
            byteBuffer.putFloat(b);
        }
        
        return byteBuffer;
    }
    
    private String buildPredictionsArray(float[] predictions) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < predictions.length; i++) {
            sb.append("{\"label\":\"").append(labels.get(i))
              .append("\",\"confidence\":").append(Math.round(predictions[i] * 100)).append("}");
            if (i < predictions.length - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}
```

### File 2: Register Plugin in MainActivity

Edit file: `android/app/src/main/java/com/cropguard/app/MainActivity.java`

```java
package com.cropguard.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register the TFLite plugin
        registerPlugin(TFLitePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
```

---

## PART 5: UPDATE WEB CODE TO USE TFLITE PLUGIN

### File to Modify: `src/services/diseaseDetectionService.ts`

Replace the entire file with this:

```typescript
import { Capacitor } from '@capacitor/core';

export interface DetectionResult {
  id: string;
  diseaseName: string;
  description: string;
  confidence: number;
  severity: "Mild" | "Moderate" | "Severe";
  suggestions: MedicineSuggestion[];
  imageUrl: string;
  detectedAt: string;
}

export interface MedicineSuggestion {
  name: string;
  description: string;
  application: string;
  safetyNote: string;
}

// Disease information database
const DISEASE_INFO: Record<string, {
  description: string;
  severity: "Mild" | "Moderate" | "Severe";
  suggestions: MedicineSuggestion[];
}> = {
  "Healthy": {
    description: "The maize leaf appears healthy with no visible signs of disease.",
    severity: "Mild",
    suggestions: [{
      name: "No Treatment Needed",
      description: "Continue regular care and monitoring",
      application: "Maintain proper watering and fertilization schedule",
      safetyNote: "Keep monitoring for any signs of disease"
    }]
  },
  "Northern Corn Leaf Blight": {
    description: "A fungal disease causing cigar-shaped lesions on leaves, reducing photosynthesis and yield.",
    severity: "Moderate",
    suggestions: [
      {
        name: "Azoxystrobin",
        description: "Broad-spectrum fungicide effective against Northern Corn Leaf Blight",
        application: "Apply as foliar spray when disease first appears. Repeat every 14 days if needed.",
        safetyNote: "Always follow label instructions and local regulations."
      },
      {
        name: "Propiconazole",
        description: "Systemic fungicide for preventive and curative control",
        application: "Mix 250ml per hectare in water. Apply during early growth stages.",
        safetyNote: "Wear protective equipment during application."
      }
    ]
  },
  "Common Rust": {
    description: "Fungal disease characterized by small, circular to elongate pustules on both leaf surfaces.",
    severity: "Mild",
    suggestions: [{
      name: "Mancozeb",
      description: "Protective fungicide for rust control",
      application: "Apply as foliar spray at first sign of disease. Reapply every 7-10 days.",
      safetyNote: "Do not apply within 14 days of harvest."
    }]
  },
  "Gray Leaf Spot": {
    description: "Severe fungal disease causing rectangular lesions between leaf veins, leading to premature leaf death.",
    severity: "Severe",
    suggestions: [
      {
        name: "Pyraclostrobin + Metconazole",
        description: "Combination fungicide for effective Gray Leaf Spot control",
        application: "Apply 400ml per hectare. Start applications at first disease symptoms.",
        safetyNote: "Follow resistance management practices. Rotate with different mode of action fungicides."
      },
      {
        name: "Trifloxystrobin",
        description: "Strobilurin fungicide with protective and curative activity",
        application: "Apply as foliar spray. Use 300ml per hectare in adequate water volume.",
        safetyNote: "Always consult local agricultural extension for expert advice."
      }
    ]
  },
  "Cercospora Leaf Spot": {
    description: "Fungal disease causing gray to tan lesions with dark borders on maize leaves.",
    severity: "Moderate",
    suggestions: [{
      name: "Chlorothalonil",
      description: "Broad-spectrum fungicide for Cercospora control",
      application: "Apply at 1.5-2 liters per hectare when symptoms appear.",
      safetyNote: "Avoid application during windy conditions."
    }]
  }
};

// Register the TFLite plugin for Capacitor
declare global {
  interface Window {
    Capacitor?: {
      Plugins?: {
        TFLite?: {
          detectDisease: (options: { imageBase64: string }) => Promise<{
            diseaseName: string;
            confidence: number;
            allPredictions: string;
          }>;
        };
      };
    };
  }
}

export const diseaseDetectionService = {
  async detectDisease(imageFile: File): Promise<DetectionResult> {
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Check if running on native platform with TFLite plugin
    if (Capacitor.isNativePlatform() && window.Capacitor?.Plugins?.TFLite) {
      try {
        // Convert file to base64
        const base64 = await fileToBase64(imageFile);
        
        // Call native TFLite plugin
        const result = await window.Capacitor.Plugins.TFLite.detectDisease({
          imageBase64: base64
        });
        
        const diseaseName = result.diseaseName;
        const diseaseData = DISEASE_INFO[diseaseName] || DISEASE_INFO["Healthy"];
        
        return {
          id: `detection-${Date.now()}`,
          diseaseName: diseaseName,
          description: diseaseData.description,
          confidence: result.confidence,
          severity: diseaseData.severity,
          suggestions: diseaseData.suggestions,
          imageUrl: imageUrl,
          detectedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error("TFLite detection failed:", error);
        throw new Error("Disease detection failed. Please try again.");
      }
    } else {
      // Web fallback - show message that model only works on Android
      throw new Error("Disease detection requires the Android app. Please install the APK to use this feature.");
    }
  }
};

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

## PART 6: ANDROID MANIFEST PERMISSIONS

Edit: `android/app/src/main/AndroidManifest.xml`

Add these permissions inside `<manifest>` tag:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.INTERNET" />
```

---

## PART 7: BUILD AND TEST

### Sync and Build

```bash
# Rebuild web app
npm run build

# Sync to Android
npx cap sync

# Open in Android Studio
npx cap open android
```

### In Android Studio

1. Wait for Gradle sync to complete
2. Click **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Test on Device

1. Transfer APK to your Android phone
2. Install and open the app
3. Take a photo of a maize leaf
4. The TFLite model will analyze and return results

---

## IMPORTANT NOTES

### Model Input Size
- Default is 224x224 pixels
- If your model uses different size, update `IMAGE_SIZE` in `TFLitePlugin.java`

### Number of Classes
- Default is 5 classes
- Update `NUM_CLASSES` in `TFLitePlugin.java` to match your labels.txt

### Model Normalization
- Current code normalizes to [0, 1]
- If your model expects [-1, 1], update the `convertBitmapToByteBuffer` method:
  ```java
  float r = (((pixel >> 16) & 0xFF) - 127.5f) / 127.5f;
  float g = (((pixel >> 8) & 0xFF) - 127.5f) / 127.5f;
  float b = ((pixel & 0xFF) - 127.5f) / 127.5f;
  ```

### Adding More Diseases
- Add disease names to `labels.txt`
- Add corresponding entries to `DISEASE_INFO` in `diseaseDetectionService.ts`
- Update `NUM_CLASSES` in Java plugin

---

## FILES SUMMARY

| File | Action | Purpose |
|------|--------|---------|
| `android/app/src/main/assets/maize_disease_model.tflite` | ADD | Your TFLite model |
| `android/app/src/main/assets/labels.txt` | ADD | Disease labels |
| `android/app/build.gradle` | MODIFY | Add TFLite dependency |
| `android/app/src/main/java/com/cropguard/app/TFLitePlugin.java` | CREATE | Native plugin |
| `android/app/src/main/java/com/cropguard/app/MainActivity.java` | MODIFY | Register plugin |
| `android/app/src/main/AndroidManifest.xml` | MODIFY | Add permissions |
| `src/services/diseaseDetectionService.ts` | REPLACE | Use native TFLite |

---

## TROUBLESHOOTING

### "Model file not found"
- Ensure model is in `android/app/src/main/assets/`
- Check filename matches exactly (case-sensitive)

### "Detection always fails"
- Check model input size matches IMAGE_SIZE
- Verify labels.txt has correct number of classes
- Check model normalization requirements

### "App crashes on startup"
- Verify TFLite dependency is added in build.gradle
- Check for Java compilation errors
- Run Gradle sync in Android Studio

### "Low confidence results"
- Ensure good lighting when taking photos
- Make sure leaf fills most of the frame
- Train model with more diverse images if needed

---

**Your model is now integrated! The app will use your TFLite model for real disease detection on Android.**
