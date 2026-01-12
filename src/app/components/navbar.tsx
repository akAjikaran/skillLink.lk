import { Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Briefcase className="h-6 w-6" />
          </div>
          <span className="font-semibold text-lg">ServiceHub</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant={currentPage === "browse" ? "default" : "ghost"}
            onClick={() => onNavigate("browse")}
          >
            Browse Services
          </Button>
          <Button
            variant={currentPage === "myprofile" ? "default" : "ghost"}
            onClick={() => onNavigate("myprofile")}
          >
            My Profile
          </Button>
          <Button
            variant={currentPage === "create" ? "default" : "ghost"}
            onClick={() => onNavigate("create")}
          >
            Create Profile
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}