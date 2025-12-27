import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, AlertCircle, CheckCircle, Activity, type LucideIcon } from "lucide-react";

interface DetectionResult {
  disease_name: string;
  confidence_level: number;
  severity: "Low" | "Medium" | "High";
  recommendations: string;
}

const Detect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const { image, file } = location.state || {};

  useEffect(() => {
    if (!image || !file) {
      navigate("/dashboard");
    }
  }, [image, file, navigate]);

  const simulateAnalysis = async () => {
    setAnalyzing(true);

    // Simulate AI analysis with realistic delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock detection results
    const mockResults: DetectionResult[] = [
      {
        disease_name: "Northern Corn Leaf Blight",
        confidence_level: 87.5,
        severity: "High",
        recommendations: "Apply fungicides containing azoxystrobin or propiconazole. Remove infected leaves and ensure proper spacing for air circulation. Monitor daily for spread."
      },
      {
        disease_name: "Common Rust",
        confidence_level: 92.3,
        severity: "Medium",
        recommendations: "Use fungicides with mancozeb or chlorothalonil. Apply early morning or late evening. Ensure adequate plant nutrition with balanced NPK fertilizer."
      },
      {
        disease_name: "Gray Leaf Spot",
        confidence_level: 78.9,
        severity: "Low",
        recommendations: "Apply strobilurin fungicides. Practice crop rotation and use resistant varieties. Maintain proper plant density and remove crop debris."
      },
      {
        disease_name: "Healthy Leaf",
        confidence_level: 95.2,
        severity: "Low",
        recommendations: "Your crop appears healthy! Continue with regular monitoring and maintain current care practices. Ensure adequate watering and nutrition."
      }
    ];

    const mockResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    setResult(mockResult);

    // Save to database
    if (user) {
      try {
        const { error } = await supabase.from("detections").insert({
          user_id: user.id,
          image_url: image,
          disease_name: mockResult.disease_name,
          confidence_level: mockResult.confidence_level,
          severity: mockResult.severity,
          recommendations: mockResult.recommendations,
        });

        if (error) throw error;
      } catch (error) {
        console.error("Error saving detection:", error);
      }
    }

    setAnalyzing(false);
  };

  useEffect(() => {
    if (image && !result && !analyzing) {
      simulateAnalysis();
    }
  }, [image]);

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

  if (!image) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image */}
          <Card className="overflow-hidden">
            <img src={image} alt="Analyzed leaf" className="h-full w-full object-cover" />
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {analyzing ? (
              <Card className="p-6">
                <h2 className="mb-4 text-2xl font-bold">Analyzing Image...</h2>
                <Progress value={66} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  AI is processing your image. This may take a few moments.
                </p>
              </Card>
            ) : result ? (
              <>
                <Card className="p-6">
                  <h2 className="mb-4 text-2xl font-bold">Detection Results</h2>
                  
                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-lg font-semibold">Disease Detected</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{result.disease_name}</p>
                  </div>

                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Confidence Level</span>
                      <span className="text-sm font-bold">{result.confidence_level}%</span>
                    </div>
                    <Progress value={result.confidence_level} className="h-3" />
                  </div>

                  <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Severity</span>
                      <Badge variant={getSeverityColor(result.severity)}>
                        {(() => {
                          const Icon = getSeverityIcon(result.severity);
                          return <Icon className="mr-1 h-3 w-3" />;
                        })()}
                        {result.severity}
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">Treatment Recommendations</h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {result.recommendations}
                  </p>
                </Card>

                <div className="flex gap-3">
                  <Button className="flex-1" onClick={() => navigate("/dashboard")}>
                    Analyze Another
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => navigate("/history")}>
                    View History
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detect;
