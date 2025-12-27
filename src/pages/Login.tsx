import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();

  // If user is already logged in, show an error message (no redirect)
  useEffect(() => {
    if (user) {
      toast({
        title: t("error") || "Error",
        description: t("alreadyLoggedIn") || "You are already logged in.",
        variant: "destructive",
      });
    }
  }, [user, toast, t]);

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="container max-w-md py-8 px-4">
          <Card className="p-6 text-center">
            <h1 className="mb-2 text-2xl font-bold">{t("alreadyLoggedInTitle") || "Already Logged In"}</h1>
            <p className="text-sm text-muted-foreground">
              {t("alreadyLoggedInMessage") || "You are already logged in. Please sign out if you want to sign in with a different account."}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.login(email, password);

      if (result.error) {
        toast({
          title: t("error"),
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("success"),
          description: t("welcomeBack"),
        });
        navigate("/detect");
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
      <div className="container max-w-md py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/auth")}
          className="mb-6"
        >
          <ArrowLeft className="me-2 h-4 w-4" />
          {t("back")}
        </Button>

        <Card className="p-8">
          <div className="mb-6 text-center">
            <div className="mb-4 flex justify-center">
              <img src={logo} alt="CropGuard Logo" className="h-16 w-16 rounded-full object-cover" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">{t("signInTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("enterCredentials")}
            </p>
          </div>

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

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t("signingIn")}
                </>
              ) : (
                t("signInTitle")
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t("dontHaveAccount")} </span>
            <Link to="/signup" className="font-medium text-primary hover:underline">
              {t("signUpTitle")}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
