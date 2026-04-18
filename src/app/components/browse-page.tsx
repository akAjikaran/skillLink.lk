import { useState, useEffect } from "react";
import { Search, MapPin, Filter, Star, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
  const [searchQuery, setSearchQuery] = useState(initialParams?.search || "");
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
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching categories:', error);
        } else {
          setCategories(data || []);
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

        // Search filter (name, description, or skills)
        if (searchQuery) {
          // Use safe search query to avoid Supabase errors
          const safeSearch = searchQuery.replace(/[^\w\s]/gi, '');
          query = query.or(`name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`);
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

    // Debounce search
    const timer = setTimeout(() => {
      fetchProviders();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedLocation, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setSelectedCategory("");
    setSortBy("relevance");
  };

  const activeFiltersCount =
    (searchQuery ? 1 : 0) + 
    (selectedLocation && selectedLocation !== "all" && selectedLocation !== "" ? 1 : 0) + 
    (selectedCategory && selectedCategory !== "all" && selectedCategory !== "" ? 1 : 0);

  return (
    <div className="min-h-screen pb-12">
      {/* Search and Filter Bar */}
      <div className="bg-muted/30 border-b sticky top-[73px] z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search services or providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={selectedLocation || "all"} onValueChange={(val) => setSelectedLocation(val === "all" ? "" : val)}>
                <SelectTrigger className="w-[180px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Location" />
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

              <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? "" : val)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
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

              {/* Mobile Filter Sheet */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon" className="relative">
                    <Filter className="h-4 w-4" />
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <Select value={selectedLocation || "all"} onValueChange={(val) => setSelectedLocation(val === "all" ? "" : val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Locations" />
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
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? "" : val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
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
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="newest">Newest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={clearFilters} variant="outline" className="w-full">
                      Clear Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl mb-1 font-bold">Service Providers</h1>
            <p className="text-muted-foreground font-medium">
              {isLoading ? "Searching..." : `${providers.length} ${providers.length === 1 ? "result" : "results"} found`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2 font-bold"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] hidden md:flex font-medium">
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

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
            <p className="font-medium">Loading service providers...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed max-w-2xl mx-auto">
            <div className="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6 font-medium">
              Try adjusting your filters or search query
            </p>
            <Button onClick={clearFilters} variant="outline" className="font-bold">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => {
              const category = Array.isArray(provider.categories) 
                ? provider.categories[0] 
                : provider.categories;

              return (
                <Card
                  key={provider.id}
                  className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group h-full"
                  onClick={() => onNavigate("profile", { id: provider.id })}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <CategoryIcon icon={category?.icon || "briefcase"} className="h-5 w-5" />
                      </div>
                      {provider.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm font-bold">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{provider.rating}</span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                      {provider.name}
                    </CardTitle>
                    <CardDescription className="font-semibold text-primary/80">
                      {category?.name || "Service Provider"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed min-h-[60px]">
                      {provider.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {provider.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-[10px] px-2 py-0">
                          {skill}
                        </Badge>
                      ))}
                      {provider.skills.length > 3 && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0">
                          +{provider.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4 mt-auto font-medium">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{provider.location}</span>
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
