import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, AlertCircle, CheckCircle, Activity, type LucideIcon } from "lucide-react";
import { format } from "date-fns";

interface Detection {
  id: string;
  image_url: string;
  disease_name: string;
  confidence_level: number;
  severity: string;
  recommendations: string;
  detected_at: string;
}

const History = () => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDetections();
  }, [user]);

  const fetchDetections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("detections")
        .select("*")
        .eq("user_id", user.id)
        .order("detected_at", { ascending: false });

      if (error) throw error;
      setDetections(data || []);
    } catch (error) {
      console.error("Error fetching detections:", error);
      toast({
        title: t("error"),
        description: t("failedToLoadHistory"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("detections").delete().eq("id", id);

      if (error) throw error;

      setDetections(detections.filter((d) => d.id !== id));
      toast({
        title: t("deleted"),
        description: t("detectionRemoved"),
      });
    } catch (error) {
      console.error("Error deleting detection:", error);
      toast({
        title: t("error"),
        description: t("failedToDelete"),
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "destructive";
      case "Medium":
        return "warning";
      default:
        return "success";
    }
  };

  const getSeverityIcon = (severity: string): LucideIcon => {
    switch (severity) {
      case "High":
        return AlertCircle;
      case "Medium":
        return Activity;
      default:
        return CheckCircle;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate("/detect")} className="mb-6">
          <ArrowLeft className="me-2 h-4 w-4" />
          {t("back")}
        </Button>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{t("detectionHistory")}</h1>
          <p className="text-muted-foreground">
            {t("trackHistoryDesc")}
          </p>
        </div>

        {loading ? (
          <div className="text-center">
            <p className="text-muted-foreground">{t("loading")}</p>
          </div>
        ) : detections.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="mb-4 text-lg text-muted-foreground">
              {t("noHistory")}
            </p>
            <Button onClick={() => navigate("/detect")}>
              {t("startDetecting")}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {detections.map((detection) => (
              <Card key={detection.id} className="overflow-hidden">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={detection.image_url}
                    alt={detection.disease_name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-semibold">{detection.disease_name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(detection.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className="mb-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("confidence")}</span>
                      <span className="font-medium">{detection.confidence_level}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("severity")}</span>
                      <Badge variant={getSeverityColor(detection.severity)} className="text-xs">
                        {(() => {
                          const Icon = getSeverityIcon(detection.severity);
                          return <Icon className="me-1 h-3 w-3" />;
                        })()}
                        {detection.severity}
                      </Badge>
                    </div>
                  </div>

                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {detection.recommendations}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {t("detected")}: {format(new Date(detection.detected_at), "PPp")}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
