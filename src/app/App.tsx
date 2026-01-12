import { useState } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { Navbar } from "./components/navbar";
import { HomePage } from "./components/home-page";
import { BrowsePage } from "./components/browse-page";
import { ProfilePage } from "./components/profile-page";
import { CreateServicePage } from "./components/create-service-page";
import { MyProfilePage } from "./components/my-profile-page";
import { Toaster } from "./components/ui/sonner";

type Page = "home" | "browse" | "profile" | "create" | "myprofile" | "edit";

interface NavigationParams {
  id?: string;
  search?: string;
  location?: string;
  category?: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [navParams, setNavParams] = useState<NavigationParams>({});

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page as Page);
    setNavParams(params || {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ThemeProvider>
      <div className="max-w-7xl mx-auto bg-background text-foreground">
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
        
        {currentPage === "home" && <HomePage onNavigate={handleNavigate} />}
        
        {currentPage === "browse" && (
          <BrowsePage onNavigate={handleNavigate} initialParams={navParams} />
        )}
        
        {currentPage === "profile" && navParams.id && (
          <ProfilePage onNavigate={handleNavigate} providerId={navParams.id} />
        )}
        
        {currentPage === "create" && <CreateServicePage onNavigate={handleNavigate} />}
        
        {currentPage === "myprofile" && <MyProfilePage onNavigate={handleNavigate} />}
        
        {currentPage === "edit" && navParams.id && (
          <CreateServicePage onNavigate={handleNavigate} editId={navParams.id} />
        )}
        
        <Toaster />
      </div>
    </ThemeProvider>
  );
}