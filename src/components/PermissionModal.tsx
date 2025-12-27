import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Image } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "camera" | "gallery";
  onAllow: () => void;
  onCancel: () => void;
}

export const PermissionModal = ({
  open,
  onOpenChange,
  type,
  onAllow,
  onCancel,
}: PermissionModalProps) => {
  const { t } = useLanguage();
  const isCameraPermission = type === "camera";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {isCameraPermission ? (
              <Camera className="h-6 w-6 text-primary" />
            ) : (
              <Image className="h-6 w-6 text-primary" />
            )}
          </div>
          <DialogTitle className="text-center">
            {isCameraPermission ? t("cameraPermission") : t("galleryPermission")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isCameraPermission ? t("cameraPermissionDesc") : t("galleryPermissionDesc")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onAllow} className="w-full">
            {t("allow")}
          </Button>
          <Button onClick={onCancel} variant="outline" className="w-full">
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
