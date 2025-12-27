import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const handlePasswordReset = async () => {
      // Get the code from URL query params (Supabase PKCE flow)
      const code = searchParams.get("code");
      
      // Also check for error in URL (Supabase sends errors this way)
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      
      if (errorParam) {
        setError(errorDescription || t("invalidResetLinkMessage"));
        setVerifying(false);
        return;
      }

      if (code) {
        // Exchange the code for a session using PKCE flow
        // This is the recommended approach per Supabase docs
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("Code exchange error:", exchangeError);
            setError(exchangeError.message || t("invalidResetLinkMessage"));
            setVerifying(false);
            return;
          }
          
          // Successfully exchanged code for session
          setSessionReady(true);
          setVerifying(false);
        } catch (err: any) {
          console.error("Unexpected error during code exchange:", err);
          setError(t("unexpectedError"));
          setVerifying(false);
        }
      } else {
        // No code in URL - check if there's already an active session
        // This handles the case where Supabase uses hash-based auth
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setSessionReady(true);
        } else {
          setError(t("invalidResetLinkMessage"));
        }
        setVerifying(false);
      }
    };

    handlePasswordReset();
  }, [searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: t("error"),
        description: t("passwordMinLength"),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t("error"),
        description: t("passwordsDoNotMatch"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const result = await authService.updatePassword(newPassword);

      if (result.error) {
        toast({
          title: t("error"),
          description: result.error,
          variant: "destructive",
        });
      } else {
        // Sign out the user after password update so they can log in fresh
        await supabase.auth.signOut();
        
        toast({
          title: t("success"),
          description: t("passwordUpdatedSuccess"),
        });
        navigate("/login");
      }
    } catch (err) {
      toast({
        title: t("error"),
        description: t("unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying the reset code
  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">{t("verifyingResetLink")}</p>
        </div>
      </div>
    );
  }

  // Error state - invalid or expired link
  if (error || !sessionReady) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <div className="container max-w-md py-8 px-4">
          <Card className="p-6 sm:p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h1 className="mb-4 text-xl font-bold">{t("invalidResetLink")}</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              {error || t("invalidResetLinkMessage")}
            </p>
            <Button onClick={() => navigate("/forgot-password")} className="w-full">
              {t("requestNewLink")}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Password update form
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="container max-w-md py-8 px-4">
        <Card className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">{t("createNewPassword")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("createNewPasswordSubtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("newPassword")}</Label>
              <PasswordInput
                id="newPassword"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t("updating")}
                </>
              ) : (
                t("updatePassword")
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UpdatePassword;
