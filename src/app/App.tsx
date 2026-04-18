import { useState, useEffect } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { Navbar } from "./components/navbar";
import { HomePage } from "./components/home-page";
import { BrowsePage } from "./components/browse-page";
import { ProfilePage } from "./components/profile-page";
import { CreateServicePage } from "./components/create-service-page";
import { MyProfilePage } from "./components/my-profile-page";
import { ManageServicesPage } from "./components/manage-services-page";
import { AuthPage } from "./components/auth-page";
import { Toaster } from "./components/ui/sonner";
import { supabase } from "./lib/supabase";

type Page = "home" | "browse" | "profile" | "create" | "myprofile" | "manageservices" | "edit" | "auth";

interface NavigationParams {
  id?: string;
  search?: string;
  location?: string;
  category?: string;
  mode?: "login" | "signup";
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [navParams, setNavParams] = useState<NavigationParams>({});
  const [session, setSession] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    console.log("App initializing...");
    if (!supabase || !supabase.auth) {
      console.error("Supabase client or auth not found!");
      setIsInitializing(false);
      return;
    }

    // Check current session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        console.log("Initial session fetched:", session?.user?.email || "No session");
        setSession(session);
      } catch (err) {
        console.error("Session error during init:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session?.user?.email || "No session");
      setSession(session);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    console.log("Navigating to:", page, params);
    setCurrentPage(page as Page);
    setNavParams(params || {});
    
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.warn("Smooth scroll failed:", e);
      window.scrollTo(0, 0);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="max-w-7xl mx-auto bg-background text-foreground min-h-screen flex flex-col">
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} session={session} />
        
        <main className="flex-1">
          {currentPage === "home" && <HomePage onNavigate={handleNavigate} />}
          
          {currentPage === "browse" && (
            <BrowsePage onNavigate={handleNavigate} initialParams={navParams} />
          )}
          
          {currentPage === "profile" && navParams.id && (
            <ProfilePage onNavigate={handleNavigate} providerId={navParams.id} />
          )}
          
          {currentPage === "create" && <CreateServicePage onNavigate={handleNavigate} />}
          
          {currentPage === "myprofile" && <MyProfilePage onNavigate={handleNavigate} />}
          
          {currentPage === "manageservices" && <ManageServicesPage onNavigate={handleNavigate} />}
          
          {currentPage === "edit" && navParams.id && (
            <CreateServicePage onNavigate={handleNavigate} editId={navParams.id} />
          )}

          {currentPage === "auth" && (
            <AuthPage onNavigate={handleNavigate} initialMode={navParams.mode || "login"} />
          )}
        </main>
        
        <Toaster />
      </div>
    </ThemeProvider>
  );
}