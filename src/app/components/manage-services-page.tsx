import { useState, useEffect } from "react";
import { Briefcase, Plus, Edit, Trash2, Star, MapPin, Search, Filter, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
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
import { supabase } from "../lib/supabase";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface MyService {
  id: string;
  name: string;
  category_id: string;
  description: string;
  skills: string[];
  location: string;
  phone: string;
  email: string;
  whatsapp?: string;
  created_at: string;
  categories?: Category | Category[];
}

interface ManageServicesPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function ManageServicesPage({ onNavigate }: ManageServicesPageProps) {
  const [myServices, setMyServices] = useState<MyService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const fetchMyServices = async () => {
    setIsLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('service_providers')
        .select('*, categories(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyServices(data || []);
    } catch (error) {
      console.error("Error loading services:", error);
      toast.error("Failed to load your services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyServices();
  }, []);

  const handleDelete = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (serviceToDelete) {
      try {
        const { error } = await supabase
          .from('service_providers')
          .delete()
          .eq('id', serviceToDelete);

        if (error) throw error;

        toast.success("Service deleted successfully");
        setMyServices(myServices.filter((s) => s.id !== serviceToDelete));
      } catch (error: any) {
        console.error("Error deleting service:", error);
        toast.error(error.message || "Failed to delete service");
      } finally {
        setServiceToDelete(null);
        setDeleteDialogOpen(false);
      }
    }
  };

  const filteredServices = myServices.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Briefcase className="h-8 w-8 text-primary" />
                Manage My Services
              </h1>
              <p className="text-muted-foreground font-medium">
                View, edit, or delete your professional service listings
              </p>
            </div>
            <Button onClick={() => onNavigate("create")} className="gap-2 self-start font-bold">
              <Plus className="h-4 w-4" />
              Add New Service
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Stats Bar */}
          {!isLoading && myServices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-primary/5 border-primary/20 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Listings</p>
                    <p className="text-2xl font-bold">{myServices.length}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-500/5 border-green-500/20 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-600">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Live Status</p>
                    <p className="text-2xl font-bold text-green-600">Active</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-500/5 border-blue-500/20 col-span-1 md:col-span-2 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Main Location</p>
                      <p className="text-xl font-bold">
                        {myServices[0]?.location || "Not Set"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="hidden md:flex font-bold">
                    {new Set(myServices.map(s => s.category_id)).size} Categories
                  </Badge>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          {(myServices.length > 0 || searchQuery) && (
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Button variant="outline" className="gap-2 h-11 font-bold">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
              <p className="font-bold text-lg">Loading your listings...</p>
            </div>
          ) : myServices.length === 0 ? (
            <Card className="border-dashed border-2 bg-muted/10">
              <CardContent className="p-16 text-center">
                <div className="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No services found</h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-medium">
                  You haven't created any service listings yet. Create your first profile to start reaching customers across Sri Lanka.
                </p>
                <Button onClick={() => onNavigate("create")} size="lg" className="gap-2 font-bold px-8 h-12">
                  <Plus className="h-5 w-5" />
                  Create Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground font-bold text-lg mb-2">No results matching "{searchQuery}"</p>
              <Button variant="link" onClick={() => setSearchQuery("")} className="font-bold text-primary text-base">
                Clear search and view all listings
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                // Defensive check for categories join (could be object or array)
                const category = Array.isArray(service.categories) 
                  ? service.categories[0] 
                  : service.categories;

                return (
                  <Card key={service.id} className="group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg border-muted/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="bg-primary/10 text-primary p-2.5 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                          <CategoryIcon icon={category?.icon || "briefcase"} className="h-5 w-5" />
                        </div>
                        <div className="flex gap-2 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform md:translate-x-2 group-hover:translate-x-0">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => onNavigate("edit", { id: service.id })}
                            className="h-9 w-9 shadow-sm rounded-lg hover:bg-primary hover:text-white transition-colors"
                            title="Edit Service"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => handleDelete(service.id)}
                            className="h-9 w-9 text-destructive hover:bg-destructive hover:text-white shadow-sm rounded-lg transition-colors"
                            title="Delete Service"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <CardTitle className="text-xl mb-1 font-bold group-hover:text-primary transition-colors truncate">
                          {service.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 font-bold text-primary/80">
                          {category?.name || "Service Provider"}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-6 min-h-[60px] leading-relaxed font-medium">
                        {service.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {service.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0 font-bold uppercase tracking-tighter">
                            {skill}
                          </Badge>
                        ))}
                        {service.skills.length > 3 && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0 font-bold">
                            +{service.skills.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-4">
                        <div className="flex items-center gap-1.5 font-bold">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span>{service.location}</span>
                        </div>
                        <div className="ml-auto font-bold opacity-70">
                          {new Date(service.created_at).toLocaleDateString()}
                        </div>
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
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              This action cannot be undone. This will permanently delete your service
              profile "<strong>{myServices.find(s => s.id === serviceToDelete)?.name}</strong>" and remove it from our marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="rounded-xl font-bold h-11 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-none rounded-xl font-bold px-8 h-11"
            >
              Delete Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
