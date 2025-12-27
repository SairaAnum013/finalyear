import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { PermissionModal } from "@/components/PermissionModal";
import { imagePickerService } from "@/services/imagePickerService";
import { diseaseDetectionService, DetectionResult } from "@/services/diseaseDetectionService";
import { historyService } from "@/services/historyService";
import { Camera, Upload, Home, AlertCircle, Activity, CheckCircle, Save, AlertTriangle } from "lucide-react";

const DetectDisease = () => {
  const [warningModal, setWarningModal] = useState<"camera" | "gallery" | null>(null);
  const [permissionModal, setPermissionModal] = useState<"camera" | "gallery" | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [showConfidence, setShowConfidence] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCameraClick = () => {
    setWarningModal("camera");
  };

  const handleGalleryClick = () => {
    setWarningModal("gallery");
  };

  const handleWarningContinue = () => {
    const type = warningModal;
    setWarningModal(null);
    if (type) {
      setPermissionModal(type);
    }
  };

  const handleWarningCancel = () => {
    setWarningModal(null);
  };

  const handlePermissionAllow = async () => {
    const type = permissionModal;
    setPermissionModal(null);

    if (!type) return;

    try {
      const granted = type === "camera"
        ? await imagePickerService.requestCameraPermission()
        : await imagePickerService.requestGalleryPermission();

      if (!granted) {
        toast({
          title: t("permissionDenied"),
          description: type === "camera" ? t("cameraAccessDenied") : t("galleryAccessDenied"),
          variant: "destructive",
        });
        return;
      }

      const result = type === "camera"
        ? await imagePickerService.takePhoto()
        : await imagePickerService.pickFromGallery();

      if (result) {
        setSelectedImage(result.preview);
        setSelectedFile(result.file);
        setResult(null);
        setShowConfidence(false);
        setShowSuggestions(false);
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: type === "camera" ? t("failedToAccessCamera") : t("failedToAccessGallery"),
        variant: "destructive",
      });
    }
  };

  const handlePermissionCancel = () => {
    setPermissionModal(null);
    toast({
      title: t("accessDenied"),
      description: t("enableLaterInSettings"),
    });
  };

  const handleDetect = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    try {
      const detection = await diseaseDetectionService.detectDisease(selectedFile);
      setResult(detection);
      toast({
        title: t("detectionComplete"),
        description: `${t("detectedLabel")} ${detection.diseaseName}`,
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("failedToAnalyze"),
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (!user || !result) return;

    const saved = await historyService.addDetectionToHistory(user.id, result);
    
    if (saved.success) {
      toast({
        title: t("saved"),
        description: t("detectionSaved"),
      });
    } else {
      toast({
        title: t("error"),
        description: saved.error || t("failedToSave"),
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Severe":
        return "destructive";
      case "Moderate":
        return "warning";
      default:
        return "success";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Severe":
        return AlertCircle;
      case "Moderate":
        return Activity;
      default:
        return CheckCircle;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("appName")}</h1>
            <p className="text-sm text-muted-foreground">{t("detectDisease")}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <Home className="h-4 w-4" />
          </Button>
        </div>

        {/* Guest Mode Banner */}
        {!user && (
          <Card className="mb-6 border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{t("guestMode")}</p>
              </div>
              <Button size="sm" onClick={() => navigate("/login")}>
                {t("signIn")}
              </Button>
            </div>
          </Card>
        )}

        {!selectedImage ? (
          /* Upload Card */
          <Card className="p-8">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-semibold">{t("uploadLeafImage")}</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                {t("capturePhoto")} / {t("uploadFromGallery")}
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <Button
                  size="lg"
                  onClick={handleCameraClick}
                  className="h-32 flex-col gap-3"
                >
                  <Camera className="h-8 w-8" />
                  <span>{t("capturePhoto")}</span>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleGalleryClick}
                  className="h-32 flex-col gap-3"
                >
                  <Upload className="h-8 w-8" />
                  <span>{t("uploadFromGallery")}</span>
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          /* Preview & Results */
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <img
                src={selectedImage}
                alt={t("selectedLeafImage")}
                className="h-64 w-full object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleString()}
                </p>
                <p className="text-sm">{t("selectedLeafImage")}</p>
              </div>
            </Card>

            {!result && !analyzing && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Button onClick={handleDetect} className="w-full">
                  {t("detectDisease")}
                </Button>
                <Button
                  onClick={() => setShowConfidence(true)}
                  variant="outline"
                  disabled
                  className="w-full"
                >
                  {t("confidence")}
                </Button>
                <Button
                  onClick={() => setShowSuggestions(true)}
                  variant="outline"
                  disabled
                  className="w-full"
                >
                  {t("recommendations")}
                </Button>
              </div>
            )}

            {analyzing && (
              <Card className="p-6">
                <div className="text-center">
                  <p className="mb-4 text-lg font-medium">{t("analyzing")}</p>
                  <Progress value={66} className="mb-2" />
                  <p className="text-sm text-muted-foreground">{t("detecting")}</p>
                </div>
              </Card>
            )}

            {result && (
              <>
                <Card className="p-6">
                  <h3 className="mb-4 text-2xl font-bold">{result.diseaseName}</h3>
                  <p className="mb-4 text-muted-foreground">{result.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t("severityLabel")}</span>
                    <Badge variant={getSeverityColor(result.severity)}>
                      {(() => {
                        const Icon = getSeverityIcon(result.severity);
                        return <Icon className="me-1 h-3 w-3" />;
                      })()}
                      {result.severity}
                    </Badge>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-lg font-semibold">{t("confidence")}</h4>
                    <span className="text-2xl font-bold text-primary">{result.confidence}%</span>
                  </div>
                  <Progress value={result.confidence} className="h-3" />
                </Card>

                <Card className="p-6">
                  <h4 className="mb-4 text-lg font-semibold">{t("recommendations")}</h4>
                  <div className="space-y-4">
                    {result.suggestions.map((suggestion, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <h5 className="mb-2 font-semibold">{suggestion.name}</h5>
                        <p className="mb-2 text-sm text-muted-foreground">
                          {suggestion.description}
                        </p>
                        <p className="mb-2 text-sm">
                          <span className="font-medium">{t("application")}: </span>
                          {suggestion.application}
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          {suggestion.safetyNote}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="flex gap-3">
                  {user && (
                    <Button onClick={handleSaveToHistory} className="flex-1">
                      <Save className="me-2 h-4 w-4" />
                      {t("saveToHistory")}
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedFile(null);
                      setResult(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    {t("analyzeAnother")}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Warning Modal */}
      <AlertDialog open={warningModal !== null} onOpenChange={(open) => !open && setWarningModal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t("imageWarningTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {t("imageWarningMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleWarningCancel}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleWarningContinue}>
              {t("continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PermissionModal
        open={permissionModal !== null}
        onOpenChange={(open) => !open && setPermissionModal(null)}
        type={permissionModal || "camera"}
        onAllow={handlePermissionAllow}
        onCancel={handlePermissionCancel}
      />
    </div>
  );
};

export default DetectDisease;
