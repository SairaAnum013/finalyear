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

/**
 * Disease Detection Service
 * 
 * IMPORTANT: This currently returns MOCK DATA for demonstration.
 * 
 * TO CONNECT REAL AI API:
 * 1. Replace the mock data below with actual API call
 * 2. Example API endpoint: POST ${import.meta.env.VITE_API_URL}/api/detect
 * 3. Send the image file as FormData
 * 4. Parse the response and map it to DetectionResult
 * 
 * Example real implementation:
 * 
 * const formData = new FormData();
 * formData.append('image', imageFile);
 * 
 * const response = await fetch(`${import.meta.env.VITE_API_URL}/api/detect`, {
 *   method: 'POST',
 *   body: formData,
 * });
 * 
 * const data = await response.json();
 * return mapApiResponseToDetectionResult(data);
 */
export const diseaseDetectionService = {
  /**
   * Detect disease from maize leaf image
   */
  async detectDisease(imageFile: File): Promise<DetectionResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create a local URL for the image
    const imageUrl = URL.createObjectURL(imageFile);

    // MOCK DATA - Replace this with real API call
    const mockDiseases = [
      {
        name: "Northern Corn Leaf Blight",
        description: "A fungal disease causing cigar-shaped lesions on leaves, reducing photosynthesis and yield.",
        severity: "Moderate" as const,
        confidence: 87 + Math.random() * 10,
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
      {
        name: "Common Rust",
        description: "Fungal disease characterized by small, circular to elongate pustules on both leaf surfaces.",
        severity: "Mild" as const,
        confidence: 82 + Math.random() * 10,
        suggestions: [
          {
            name: "Mancozeb",
            description: "Protective fungicide for rust control",
            application: "Apply as foliar spray at first sign of disease. Reapply every 7-10 days.",
            safetyNote: "Do not apply within 14 days of harvest."
          }
        ]
      },
      {
        name: "Gray Leaf Spot",
        description: "Severe fungal disease causing rectangular lesions between leaf veins, leading to premature leaf death.",
        severity: "Severe" as const,
        confidence: 91 + Math.random() * 8,
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
      }
    ];

    // Randomly select a disease for demo
    const selectedDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];

    return {
      id: `detection-${Date.now()}`,
      diseaseName: selectedDisease.name,
      description: selectedDisease.description,
      confidence: Math.round(selectedDisease.confidence),
      severity: selectedDisease.severity,
      suggestions: selectedDisease.suggestions,
      imageUrl: imageUrl,
      detectedAt: new Date().toISOString(),
    };
  }
};
