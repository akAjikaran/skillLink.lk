import { useState, useEffect } from "react";
import { Search, MapPin, ArrowRight, Star, Loader2, Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { sriLankanDistricts } from "../data/mock-data";
import { CategoryIcon } from "./category-icon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { supabase } from "../lib/supabase";

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface ServiceProvider {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  categories?: Category | Category[];
}

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentProviders, setRecentProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch Categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (catError) {
          console.error('Error fetching categories:', catError);
        } else {
          setCategories(catData || []);
        }

        // Fetch Recent Providers
        const { data: provData, error: provError } = await supabase
          .from('service_providers')
          .select('*, categories(*)')
          .order('created_at', { ascending: false })
          .limit(4);
        
        if (provError) {
          console.error('Error fetching providers:', provError);
        } else {
          setRecentProviders(provData || []);
        }
      } catch (error) {
        console.error('Unexpected error in fetchData:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearch = () => {
    onNavigate("browse", { search: searchQuery, location: searchLocation });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className=" bg-gradient-to-b from-primary/5 to-transparent py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 font-bold tracking-tight">
            Find Trusted Service Providers
            <br />
            <span className="text-primary">Near You</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with verified professionals across Sri Lanka. From plumbers to designers,
            find the perfect service provider for your needs.
          </p>

          {/* Search Bar */}
          <div className="bg-card rounded-xl shadow-lg p-4 max-w-3xl mx-auto border border-border">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="What service do you need?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 h-12 border-none bg-muted/50 focus-visible:ring-1"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Select value={searchLocation} onValueChange={setSearchLocation}>
                  <SelectTrigger className="pl-10 h-12 border-none bg-muted/50 focus-visible:ring-1">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {sriLankanDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch} size="lg" className="md:w-auto h-12 px-8 font-bold">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground">
              Explore our wide range of service categories
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onNavigate("browse", { category: category.id })}
                  className="group"
                >
                  <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full border-muted/50">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="bg-primary/10 text-primary p-4 rounded-full mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <CategoryIcon icon={category.icon} className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-sm">{category.name}</p>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Providers Section */}
      <section className="py-16 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Recently Joined Providers</h2>
              <p className="text-muted-foreground">
                Connect with the latest professionals in our community
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onNavigate("browse")}
              className="hidden md:flex items-center gap-2 font-bold"
            >
              Browse All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentProviders.map((provider) => {
                // Defensive check for categories join (could be object or array)
                const category = Array.isArray(provider.categories) 
                  ? provider.categories[0] 
                  : provider.categories;

                return (
                  <Card
                    key={provider.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer bg-card group"
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
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 h-10 leading-relaxed">
                        {provider.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-3 mt-auto font-medium">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{provider.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!isLoading && recentProviders.length === 0 && (
            <div className="text-center py-20 bg-card rounded-2xl border-2 border-dashed max-w-2xl mx-auto">
              <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No service providers yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first professional to join our community!
              </p>
              <Button onClick={() => onNavigate("create")} className="font-bold">
                Create Your Profile
              </Button>
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Button
              variant="outline"
              onClick={() => onNavigate("browse")}
              className="gap-2 font-bold w-full"
            >
              View All Providers
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-primary text-primary-foreground overflow-hidden shadow-2xl border-none">
            <CardContent className="p-12 text-center relative">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] from-white/10 to-transparent pointer-events-none" />
              <h2 className="text-3xl font-bold mb-4 tracking-tight">Are You a Service Provider?</h2>
              <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto font-medium leading-relaxed">
                Join our platform and connect with customers across Sri Lanka.
                Create your professional profile in minutes and start growing your business!
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => onNavigate("create")}
                className="gap-2 font-bold px-8 h-12 shadow-lg hover:scale-105 transition-transform"
              >
                Create Your Service Profile
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-muted/10">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <CategoryIcon icon="briefcase" className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">ServiceHub</span>
          </div>
          <p className="mb-2 font-medium">© 2026 ServiceHub. All rights reserved.</p>
          <p className="text-sm">Connecting trusted service providers with customers across Sri Lanka</p>
        </div>
      </footer>
    </div>
  );
}
