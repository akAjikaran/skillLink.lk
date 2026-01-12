import { useState, useEffect } from "react";
import { User, Plus, Edit, Trash2, Star, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { categories } from "../data/mock-data";
import { CategoryIcon } from "./category-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner";

interface MyService {
  id: string;
  name: string;
  category: string;
  description: string;
  skills: string[];
  location: string;
  phone: string;
  email: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  createdAt: string;
}

interface MyProfilePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function MyProfilePage({ onNavigate }: MyProfilePageProps) {
  const [myServices, setMyServices] = useState<MyService[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Load services from localStorage
    const stored = localStorage.getItem("myServices");
    if (stored) {
      try {
        setMyServices(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading services:", error);
      }
    }
  }, []);

  const handleDelete = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (serviceToDelete) {
      const updated = myServices.filter((s) => s.id !== serviceToDelete);
      setMyServices(updated);
      localStorage.setItem("myServices", JSON.stringify(updated));
      toast.success("Service deleted successfully");
      setServiceToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary text-primary-foreground p-4 rounded-full">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl mb-1">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your service listings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Services</p>
                    <p className="text-3xl font-semibold">{myServices.length}</p>
                  </div>
                  <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <User className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Listings</p>
                    <p className="text-3xl font-semibold">{myServices.length}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 p-3 rounded-full">
                    <Star className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Categories</p>
                    <p className="text-3xl font-semibold">
                      {new Set(myServices.map((s) => s.category)).size}
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 p-3 rounded-full">
                    <MapPin className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">My Services</h2>
            <Button onClick={() => onNavigate("create")} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Service
            </Button>
          </div>

          {myServices.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="bg-muted/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl mb-2">No services yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first service profile to get started
                </p>
                <Button onClick={() => onNavigate("create")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myServices.map((service) => {
                const category = categories.find((c) => c.id === service.category);
                return (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="bg-primary/10 text-primary p-2 rounded-lg">
                          <CategoryIcon icon={category?.icon || "briefcase"} className="h-5 w-5" />
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onNavigate("edit", { id: service.id })}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(service.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>{category?.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {service.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {service.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {service.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{service.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{service.location}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created {new Date(service.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your service
              profile from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
