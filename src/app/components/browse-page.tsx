import { useState, useEffect } from "react";
import { MapPin, Filter, Star, X, Loader2, Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import { sriLankanDistricts } from "../data/mock-data";
import { CategoryIcon } from "./category-icon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { supabase } from "../lib/supabase";

interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

interface ServiceProvider {
  id: string;
  name: string;
  category_id: string;
  description: string;
  skills: string[];
  location: string;
  rating: number;
  created_at: string;
  categories?: Category | Category[]; // Joined data
}

interface BrowsePageProps {
  onNavigate: (page: string, params?: any) => void;
  initialParams?: {
    search?: string;
    location?: string;
    category?: string;
  };
}

export function BrowsePage({ onNavigate, initialParams }: BrowsePageProps) {
  const [selectedLocation, setSelectedLocation] = useState(initialParams?.location || "");
  const [selectedCategory, setSelectedCategory] = useState(initialParams?.category || "");
  const [sortBy, setSortBy] = useState("relevance");
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*');
        
        if (error) {
          console.error('Error fetching categories:', error);
        } else if (data) {
          const priorityOrder = ["plumber", "electrician", "cctv", "ac-repair"];
          const sortedCategories = [...data].sort((a, b) => {
            const indexA = priorityOrder.indexOf(a.slug);
            const indexB = priorityOrder.indexOf(b.slug);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
          });
          setCategories(sortedCategories);
        }
      } catch (error) {
        console.error('Unexpected error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  // Fetch Service Providers with filters
  useEffect(() => {
    async function fetchProviders() {
      setIsLoading(true);
      try {
        let query = supabase
          .from('service_providers')
          .select('*, categories(*)');

        // Location filter
        if (selectedLocation && selectedLocation !== "all" && selectedLocation !== "") {
          query = query.eq('location', selectedLocation);
        }

        // Category filter
        if (selectedCategory && selectedCategory !== "all" && selectedCategory !== "") {
          query = query.eq('category_id', selectedCategory);
        }

        // Sort
        if (sortBy === "rating") {
          query = query.order('rating', { ascending: false });
        } else if (sortBy === "newest") {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;
        setProviders(data || []);
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProviders();
  }, [selectedLocation, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSelectedLocation("");
    setSelectedCategory("");
    setSortBy("relevance");
  };

  const activeFiltersCount =
    (selectedLocation && selectedLocation !== "all" && selectedLocation !== "" ? 1 : 0) + 
    (selectedCategory && selectedCategory !== "all" && selectedCategory !== "" ? 1 : 0);

  return (
    <div className="min-h-screen pb-12">
      {/* Filter Bar */}
      <div className="bg-muted/30 border-b sticky top-[73px] z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="hidden md:flex items-center gap-2 text-muted-foreground mr-2 font-bold text-sm">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>
              
              <div className="flex-1 md:flex-none">
                <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? "" : val)}>
                  <SelectTrigger className="w-full md:w-[220px] font-bold h-11 bg-background">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <SelectValue placeholder="All Categories" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 md:flex-none">
                <Select value={selectedLocation || "all"} onValueChange={(val) => setSelectedLocation(val === "all" ? "" : val)}>
                  <SelectTrigger className="w-full md:w-[220px] font-bold h-11 bg-background">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <SelectValue placeholder="All Locations" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {sriLankanDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  className="hidden md:flex text-muted-foreground hover:text-destructive"
                  title="Clear Filters"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px] font-medium h-11 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">Available Experts</h1>
          <p className="text-muted-foreground font-medium">
            {isLoading ? "Finding specialists..." : `${providers.length} verified ${providers.length === 1 ? "pro" : "pros"} found`}
          </p>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary opacity-50" />
            <p className="font-bold tracking-wide uppercase text-xs">Synchronizing with network...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed max-w-2xl mx-auto px-6">
            <div className="bg-muted rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Briefcase className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No specialists available</h3>
            <p className="text-muted-foreground mb-8 font-medium leading-relaxed">
              We couldn't find any experts matching these criteria in your area yet. 
              Try expanding your location or checking another category.
            </p>
            <Button onClick={clearFilters} variant="default" className="font-bold px-8 h-12">
              Show All Available Pros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {providers.map((provider) => {
              const category = Array.isArray(provider.categories) 
                ? provider.categories[0] 
                : provider.categories;

              return (
                <Card
                  key={provider.id}
                  className="hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer group h-full border-muted/50 overflow-hidden"
                  onClick={() => onNavigate("profile", { id: provider.id })}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <CategoryIcon icon={category?.icon || "briefcase"} className="h-6 w-6" />
                      </div>
                      {provider.rating > 0 && (
                        <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-700 px-3 py-1 rounded-full text-sm font-black">
                          <Star className="h-4 w-4 fill-yellow-500" />
                          <span>{provider.rating}</span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors leading-tight">
                      {provider.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                       <Badge variant="secondary" className="font-bold bg-primary/5 text-primary border-none">
                        {category?.name || "Expert"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed italic">
                      "{provider.description}"
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {provider.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-[10px] uppercase tracking-wider font-black py-0.5 border-muted-foreground/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm border-t pt-5 mt-auto">
                      <div className="flex items-center gap-2 font-bold text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{provider.location}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="font-black text-primary hover:bg-primary/10">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
