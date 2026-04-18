import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Logo } from "./logo";

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  session: any;
}

export function Navbar({ onNavigate, currentPage, session }: NavbarProps) {
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      onNavigate("home");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  const user = session?.user;
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Logo className="text-primary" width={110} height={30} />
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1 mr-2">
            <Button
              variant={currentPage === "browse" ? "secondary" : "ghost"}
              onClick={() => onNavigate("browse")}
              className="font-semibold"
            >
              Find Services
            </Button>
            
            {session && (
              <Button
                variant={currentPage === "manageservices" ? "secondary" : "ghost"}
                onClick={() => onNavigate("manageservices")}
                className="font-semibold"
              >
                My Services
              </Button>
            )}
          </div>

          <ThemeToggle />
          
          <div className="h-8 w-px bg-border mx-1" />

          {session ? (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate("myprofile")}
                className="flex items-center gap-3 px-2 rounded-full hover:bg-muted transition-colors"
              >
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left hidden lg:flex">
                  <span className="text-sm font-bold leading-none">{fullName}</span>
                  <span className="text-xs text-muted-foreground mt-1">{user?.email}</span>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign Out"
                className="text-muted-foreground hover:text-destructive transition-colors rounded-full"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="default"
              onClick={() => onNavigate("auth", { mode: "login" })}
              className="font-bold px-6 shadow-md"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}