import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import maizeLeaf from "@/assets/maize-leaf.jpg";

const Dashboard = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCameraClick = () => {
    toast({
      title: "Camera Access Required",
      description: "Please allow camera access to capture leaf images",
    });
    setTimeout(() => cameraInputRef.current?.click(), 500);
  };

  const handleGalleryClick = () => {
    toast({
      title: "Gallery Access Required",
      description: "Please allow access to select images from your gallery",
    });
    setTimeout(() => fileInputRef.current?.click(), 500);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetect = () => {
    if (!selectedImage || !selectedFile) {
      toast({
        title: "No image selected",
        description: "Please capture or upload an image first",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/detect", { state: { image: selectedImage, file: selectedFile } });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Disease Detection</h1>
          <p className="text-muted-foreground">
            Capture or upload a maize leaf image to detect diseases
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image Preview */}
          <Card className="overflow-hidden">
            <div className="aspect-square bg-muted/50">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Selected leaf"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <img
                      src={maizeLeaf}
                      alt="Placeholder"
                      className="mx-auto mb-4 h-32 w-32 rounded-lg object-cover opacity-50"
                    />
                    <p className="text-sm text-muted-foreground">
                      No image selected
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Capture Options</h3>
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleCameraClick}
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Take Photo
                </Button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={handleGalleryClick}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload from Gallery
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </Card>

            {selectedImage && (
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Analyze Image</h3>
                <Button size="lg" className="w-full" onClick={handleDetect}>
                  Detect Disease
                </Button>
              </Card>
            )}

            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              onClick={() => navigate("/history")}
            >
              <History className="mr-2 h-5 w-5" />
              View Detection History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
