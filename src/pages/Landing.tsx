import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, History, Shield, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-maize.jpg";
import logo from "@/assets/logo.jpg";

const Landing = () => {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        
        <div className="container relative z-10 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <img src={logo} alt="CropGuard Logo" className="h-24 w-24 rounded-full object-cover shadow-lg" />
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
              {t("heroTitle")} <span className="text-primary">{t("heroTitleHighlight")}</span> {t("heroTitleEnd")}
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="text-lg">
                <Link to="/auth">{t("getStartedFree")}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg">
                <Link to="/detect">{t("startDetecting")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            {t("whyChoose")}
          </h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{t("easyCapture")}</h3>
              <p className="text-muted-foreground">
                {t("easyCaptureDesc")}
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{t("aiPowered")}</h3>
              <p className="text-muted-foreground">
                {t("aiPoweredDesc")}
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{t("treatmentGuidance")}</h3>
              <p className="text-muted-foreground">
                {t("treatmentGuidanceDesc")}
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <History className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{t("trackHistory")}</h3>
              <p className="text-muted-foreground">
                {t("trackHistoryDesc")}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            {t("readyToProtect")}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t("joinFarmers")}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
