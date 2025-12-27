import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, User, History, LogOut, Globe } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Centered Logo */}
        <div className="flex flex-1 items-center justify-center">
          <Link to={user ? "/detect" : "/"} className="flex items-center gap-2">
            <img src={logo} alt="CropGuard Logo" className="h-10 w-10 rounded-full object-cover" />
            <span className="text-lg sm:text-xl font-bold text-foreground">{t("appName")}</span>
          </Link>
        </div>

        {/* Navigation + Language Selector */}
        <nav className="absolute end-4 flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-accent" : ""}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("ur")} className={language === "ur" ? "bg-accent" : ""}>
                اردو
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Navigation - Only show for logged-in users */}
          {user && (
            isMobile ? (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={language === "ur" ? "left" : "right"} className="w-64">
                  <div className="flex flex-col gap-4 mt-8">
                    <Button
                      variant="ghost"
                      className="justify-start gap-2"
                      asChild
                      onClick={() => setOpen(false)}
                    >
                      <Link to="/profile">
                        <User className="h-4 w-4" />
                        {t("profile")}
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start gap-2"
                      asChild
                      onClick={() => setOpen(false)}
                    >
                      <Link to="/history">
                        <History className="h-4 w-4" />
                        {t("history")}
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start gap-2 text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      {t("signOut")}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <>
                <Button variant="ghost" size={isMobile ? "sm" : "default"} asChild>
                  <Link to="/profile">
                    <User className="me-2 h-4 w-4" />
                    {t("profile")}
                  </Link>
                </Button>
                <Button variant="ghost" size={isMobile ? "sm" : "default"} asChild>
                  <Link to="/history">
                    <History className="me-2 h-4 w-4" />
                    {t("history")}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size={isMobile ? "sm" : "default"}
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive"
                >
                  <LogOut className="me-2 h-4 w-4" />
                  {t("signOut")}
                </Button>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  );
};
