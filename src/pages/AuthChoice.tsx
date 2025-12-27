import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.jpg";

const AuthChoice = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="container max-w-md py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="me-2 h-4 w-4" />
          {t("back")}
        </Button>

        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <img src={logo} alt="CropGuard Logo" className="h-20 w-20 rounded-full object-cover shadow-md" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">{t("welcomeToCropGuard")}</h1>
          <p className="text-muted-foreground">
            {t("chooseHowToContinue")}
          </p>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{t("signInTitle")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("alreadyHaveAccountShort")}
                </p>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate("/login")}
            >
              {t("signInTitle")}
            </Button>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{t("signUpTitle")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("createNewAccount")}
                </p>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate("/signup")}
            >
              {t("createAccount")}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthChoice;
