import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.jpg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: t("error"),
        description: t("emailRequired"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await authService.requestPasswordReset(email);

      if (result.error) {
        toast({
          title: t("error"),
          description: result.error,
          variant: "destructive",
        });
      } else {
        setLinkSent(true);
        toast({
          title: t("success"),
          description: t("resetLinkSent"),
        });
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="container max-w-md py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/login")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToSignIn")}
        </Button>

        <Card className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <img src={logo} alt="CropGuard Logo" className="h-16 w-16 rounded-full object-cover" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">{t("resetPassword")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("resetPasswordSubtitle")}
            </p>
          </div>

          {linkSent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("resetLinkSentMessage")}
              </p>
              <Link
                to="/login"
                className="inline-block text-sm font-medium text-primary hover:underline"
              >
                {t("backToSignIn")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("sending")}
                  </>
                ) : (
                  t("sendResetLink")
                )}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("backToSignIn")}
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
