import { useState, useEffect } from "react";
import { Search, MapPin, ArrowRight, Star, Loader2, Briefcase, Wrench, Zap, Wind, ShieldCheck, ChevronDown, ArrowUpRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { sriLankanDistricts } from "../data/mock-data";
import { CategoryIcon } from "./category-icon";
import { Badge } from "./ui/badge";
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
  slug: string;
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
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [recentProviders, setRecentProviders] = useState<ServiceProvider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const priorityOrder = ["plumber", "electrician", "cctv", "ac-repair"];

  const serviceSupportingText: Record<string, string> = {
    plumber: "Water leaks • Pipe issues • Bathroom repairs",
    electrician: "Power issues • Fan repair • Wiring",
    cctv: "Camera installation • Wiring setup",
    "ac-repair": "Not cooling • Water leaking • Strange noise • Servicing",
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch Categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*');
        
        if (catError) {
          console.error('Error fetching categories:', catError);
        } else if (catData) {
          // Manually sort categories based on priorityOrder
          const sortedCategories = [...catData].sort((a, b) => {
            const indexA = priorityOrder.indexOf(a.slug);
            const indexB = priorityOrder.indexOf(b.slug);
            
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
          });
          setCategories(sortedCategories);
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
    onNavigate("browse", { category: selectedCategoryId, location: searchLocation });
  };

  const getServiceColor = (slug: string) => {
    switch (slug) {
      case 'plumber': return "bg-blue-500/10 text-blue-600";
      case 'electrician': return "bg-yellow-500/10 text-yellow-600";
      case 'ac-repair': return "bg-cyan-500/10 text-cyan-600";
      case 'cctv': return "bg-purple-500/10 text-purple-600";
      default: return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 px-4 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            {/* Left side: Services Cards & Search */}
            <div className="w-full lg:w-1/2 order-2 lg:order-1">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.length > 0 ? (
                    categories.slice(0, 4).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => onNavigate("browse", { category: category.id })}
                        className="group text-left"
                      >
                        <Card className="border-muted/50 transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] h-full">
                          <CardContent className="p-5 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-4">
                              <div className={`p-3 rounded-2xl transition-colors group-hover:bg-primary group-hover:text-primary-foreground ${getServiceColor(category.slug)}`}>
                                <CategoryIcon icon={category.icon} className="h-6 w-6" />
                              </div>
                              <div className="bg-muted/50 p-1.5 rounded-full text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <ArrowUpRight className="h-4 w-4" />
                              </div>
                            </div>
                            <div>
                              <h4 className="font-black text-lg mb-1 leading-none">{category.name}</h4>
                              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                {serviceSupportingText[category.slug] || "Verified experts ready to fix your issues"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </button>
                    ))
                  ) : (
                    [1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-2xl" />
                    ))
                  )}
                </div>

                <div className="bg-card rounded-3xl shadow-2xl p-6 md:p-8 border border-primary/10 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    <h3 className="font-black text-xl">Quick Booking</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                      <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                        <SelectTrigger className="pl-12 h-14 bg-muted/30 border-muted rounded-2xl font-bold text-base">
                          <SelectValue placeholder="Select service needed" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-xl">
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id} className="h-12 font-medium rounded-xl">
                              <div className="flex items-center gap-2">
                                <CategoryIcon icon={category.icon} className="h-4 w-4" />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                      <Select value={searchLocation} onValueChange={setSearchLocation}>
                        <SelectTrigger className="pl-12 h-14 bg-muted/30 border-muted rounded-2xl font-bold text-base">
                          <SelectValue placeholder="Select your district" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-xl">
                          {sriLankanDistricts.map((district) => (
                            <SelectItem key={district} value={district} className="h-12 font-medium rounded-xl">
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleSearch} 
                      className="w-full h-14 text-lg font-black shadow-xl shadow-primary/20 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                      disabled={!selectedCategoryId}
                    >
                      Check Available Experts
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Hero Text */}
            <div className="w-full lg:w-1/2 text-center lg:text-left order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 text-sm bg-primary/10 text-primary border border-primary/20 rounded-full font-black uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Sri Lanka's #1 Home Fix Network
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] mb-8">
                Your Home, <br />
                <span className="text-primary underline decoration-primary/20 underline-offset-8">Fixed Right.</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-bold leading-relaxed mb-10 max-w-2xl">
                Instant connection to verified specialists for your most critical home needs. 
                Spark, leak, or security—we've got you covered.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm font-black text-muted-foreground/80">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <span>4.9/5 User Rating</span>
                </div>
                <div className="h-5 w-px bg-muted hidden sm:block" />
                <div className="flex items-center gap-2 uppercase tracking-widest">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span>100% Verified Pros</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Recent Providers Section */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black mb-3">Experts Ready Now</h2>
              <p className="text-lg text-muted-foreground font-medium">
                Highly rated specialists near you, background checked and verified.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onNavigate("browse")}
              className="h-12 px-6 rounded-xl gap-2 font-black border-2 hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Browse All Specialists
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentProviders.map((provider) => {
                const category = Array.isArray(provider.categories) 
                  ? provider.categories[0] 
                  : provider.categories;

                return (
                  <Card
                    key={provider.id}
                    className="hover:shadow-2xl transition-all cursor-pointer bg-card group border-muted/50 rounded-3xl overflow-hidden"
                    onClick={() => onNavigate("profile", { id: provider.id })}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                          <CategoryIcon icon={category?.icon || "briefcase"} className="h-6 w-6" />
                        </div>
                        {provider.rating > 0 && (
                          <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-700 px-3 py-1 rounded-full text-xs font-black">
                            <Star className="h-3.5 w-3.5 fill-yellow-500" />
                            <span>{provider.rating}</span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-xl font-black group-hover:text-primary transition-colors">
                        {provider.name}
                      </CardTitle>
                      <CardDescription className="font-bold text-primary opacity-80 uppercase tracking-tighter text-xs">
                        {category?.name || "Service Expert"} Specialist
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed italic">
                        "{provider.description}"
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-black border-t pt-5 mt-auto">
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
      </section>

      {/* Trust Section */}
      <section className="py-24 px-4 border-t relative overflow-hidden">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-black mb-20 relative z-10">Why trust HOMATE?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div className="p-8 rounded-3xl bg-card border border-muted/50 hover:shadow-xl transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-3 group-hover:rotate-0 transition-transform">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-black text-xl mb-4">Verified Experts</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">Rigorous background checks and skill verification for your peace of mind.</p>
            </div>
            <div className="p-8 rounded-3xl bg-card border border-muted/50 hover:shadow-xl transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 -rotate-3 group-hover:rotate-0 transition-transform">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-black text-xl mb-4">Quick Response</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">Immediate contact with specialists ready to help within hours.</p>
            </div>
            <div className="p-8 rounded-3xl bg-card border border-muted/50 hover:shadow-xl transition-shadow">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 rotate-6 group-hover:rotate-0 transition-transform">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-black text-xl mb-4">Guranteed Quality</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">Professional service standards and satisfaction guaranteed on every fix.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 px-4 bg-muted/10">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Logo className="text-primary" width={120} height={35} />
          </div>
          <p className="mb-2 font-black text-muted-foreground/80 uppercase tracking-widest text-xs">© 2026 HOMATE Fix Network. Sri Lanka.</p>
          <p className="text-sm font-bold text-muted-foreground max-w-sm mx-auto">Trusted experts for the most essential corners of your home.</p>
        </div>
      </footer>
    </div>
  );
}
