import { useState } from "react";
import { Search, MapPin, ArrowRight, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { categories, mockServiceProviders, sriLankanDistricts } from "../data/mock-data";
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

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const featuredProviders = mockServiceProviders.filter((p) => p.featured).slice(0, 4);

  const handleSearch = () => {
    onNavigate("browse", { search: searchQuery, location: searchLocation });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className=" bg-gradient-to-b from-primary/5 to-transparent py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">
            Find Trusted Service Providers
            <br />
            <span className="text-primary">Near You</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with verified professionals across Sri Lanka. From plumbers to designers,
            find the perfect service provider for your needs.
          </p>

          {/* Search Bar */}
          <div className="bg-card rounded-xl shadow-lg p-4 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="What service do you need?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 h-12"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Select value={searchLocation} onValueChange={setSearchLocation}>
                  <SelectTrigger className="pl-10 h-12">
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
              <Button onClick={handleSearch} size="lg" className="md:w-auto h-12 px-8">
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
            <h2 className="text-3xl mb-4">Browse by Category</h2>
            <p className="text-muted-foreground">
              Explore our wide range of service categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onNavigate("browse", { category: category.id })}
                className="group"
              >
                <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-primary/10 text-primary p-4 rounded-full mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <CategoryIcon icon={category.icon} className="h-6 w-6" />
                    </div>
                    <p className="font-medium text-sm">{category.name}</p>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl mb-2">Featured Service Providers</h2>
              <p className="text-muted-foreground">
                Top-rated professionals ready to help
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onNavigate("browse")}
              className="hidden md:flex items-center gap-2"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProviders.map((provider) => {
              const category = categories.find((c) => c.id === provider.category);
              return (
                <Card
                  key={provider.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onNavigate("profile", { id: provider.id })}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <CategoryIcon icon={category?.icon || "briefcase"} className="h-5 w-5" />
                      </div>
                      {provider.rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{provider.rating}</span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <CardDescription>{category?.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {provider.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{provider.location}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Button
              variant="outline"
              onClick={() => onNavigate("browse")}
              className="gap-2"
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
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl mb-4">Are You a Service Provider?</h2>
              <p className="text-lg mb-8 opacity-90">
                Join our platform and connect with customers across Sri Lanka.
                Create your professional profile in minutes!
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => onNavigate("create")}
                className="gap-2"
              >
                Create Your Service Profile
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="mb-2">© 2026 ServiceHub. All rights reserved.</p>
          <p className="text-sm">Connecting service providers with customers across Sri Lanka</p>
        </div>
      </footer>
    </div>
  );
}
