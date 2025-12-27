import { supabase } from "@/integrations/supabase/client";
import { DetectionResult } from "./diseaseDetectionService";

export interface HistoryItem {
  id: string;
  userId: string;
  diseaseName: string;
  confidence: number;
  severity: string;
  imageUrl: string;
  detectedAt: string;
  recommendations: string;
}

/**
 * History Service
 * 
 * Currently uses Supabase for real data persistence.
 * This abstraction makes it easy to switch backends later.
 * 
 * TO SWITCH BACKEND:
 * Replace supabase calls with your API:
 * - POST ${API_URL}/api/history (save detection)
 * - GET ${API_URL}/api/history?userId={userId} (get history)
 */
export const historyService = {
  /**
   * Save detection result to user's history
   */
  async addDetectionToHistory(
    userId: string,
    detection: DetectionResult
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("detections").insert({
        user_id: userId,
        disease_name: detection.diseaseName,
        confidence_level: detection.confidence,
        severity: detection.severity,
        image_url: detection.imageUrl,
        recommendations: detection.suggestions
          .map((s) => `${s.name}: ${s.description}`)
          .join("\n\n"),
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to save detection" };
    }
  },

  /**
   * Get detection history for a user
   */
  async getHistoryForUser(userId: string): Promise<HistoryItem[]> {
    try {
      const { data, error } = await supabase
        .from("detections")
        .select("*")
        .eq("user_id", userId)
        .order("detected_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((item) => ({
        id: item.id,
        userId: item.user_id,
        diseaseName: item.disease_name,
        confidence: item.confidence_level,
        severity: item.severity,
        imageUrl: item.image_url,
        detectedAt: item.detected_at,
        recommendations: item.recommendations,
      }));
    } catch (error) {
      console.error("Failed to fetch history:", error);
      return [];
    }
  },

  /**
   * Delete a detection from history
   */
  async deleteDetection(detectionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("detections")
        .delete()
        .eq("id", detectionId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to delete detection" };
    }
  }
};
