import { useState, useEffect } from "react";
import { ArrowLeft, Star, MapPin, Phone, Mail, MessageCircle, Facebook, Instagram, Linkedin, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { CategoryIcon } from "./category-icon";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
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
  skills: string[];
  location: string;
  phone: string;
  email: string;
  whatsapp?: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  image_url?: string;
  rating: number;
  created_at: string;
  categories?: Category | Category[];
}

interface ProfilePageProps {
  onNavigate: (page: string, params?: any) => void;
  providerId: string;
}

export function ProfilePage({ onNavigate, providerId }: ProfilePageProps) {
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProvider() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('service_providers')
          .select('*, categories(*)')
          .eq('id', providerId)
          .single();
        
        if (error) throw error;
        setProvider(data);
      } catch (error) {
        console.error('Error fetching provider:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProvider();
  }, [providerId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-card p-12 rounded-2xl shadow-xl max-w-md border border-border">
          <h2 className="text-3xl font-bold mb-4">Provider Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The service provider profile you're looking for might have been removed or the link is incorrect.
          </p>
          <Button onClick={() => onNavigate("browse")} size="lg" className="w-full font-bold">
            Browse All Services
          </Button>
        </div>
      </div>
    );
  }

  // Defensive check for categories join (could be object or array)
  const category = Array.isArray(provider.categories) 
    ? provider.categories[0] 
    : provider.categories;

  return (
    <div className="min-h-screen pb-12">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => onNavigate("browse")}
          className="gap-2 hover:bg-muted font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Button>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <Card className="border-muted/50 overflow-hidden shadow-md">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary/10 to-transparent h-24" />
                <div className="p-8 pt-0 -mt-12">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-card border-4 border-background text-primary rounded-xl flex items-center justify-center shadow-md">
                        <CategoryIcon icon={category?.icon || "briefcase"} className="h-12 w-12" />
                      </div>
                    </div>
                    <div className="flex-1 mt-12 md:mt-14">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div>
                          <h1 className="text-3xl font-bold mb-2 tracking-tight">{provider.name}</h1>
                          <p className="text-lg text-primary/80 font-bold">{category?.name || "Service Provider"}</p>
                        </div>
                        {provider.rating > 0 && (
                          <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-900 dark:text-yellow-100 px-4 py-2 rounded-lg border border-yellow-200/50 dark:border-yellow-900/50 h-fit">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-lg">{provider.rating}</span>
                            <span className="text-sm text-yellow-700/70 dark:text-yellow-300/70 font-medium">/ 5.0</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground font-bold">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span>{provider.location}, Sri Lanka</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="border-muted/50 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  About the Service
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                  {provider.description}
                </p>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card className="border-muted/50 shadow-sm">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold mb-4">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-4 py-2 text-sm font-bold">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="border-primary/20 shadow-lg overflow-hidden">
              <div className="bg-primary h-1.5" />
              <CardContent className="p-8">
                <h3 className="font-bold text-xl mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 group">
                    <div className="bg-primary/10 text-primary p-3 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Phone</p>
                      <a
                        href={`tel:${provider.phone}`}
                        className="text-lg font-bold hover:text-primary truncate block transition-colors"
                      >
                        {provider.phone}
                      </a>
                    </div>
                  </div>

                  {provider.email && (
                    <div className="flex items-center gap-4 group">
                      <div className="bg-primary/10 text-primary p-3 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Email</p>
                        <a
                          href={`mailto:${provider.email}`}
                          className="text-lg font-bold hover:text-primary truncate block transition-colors"
                        >
                          {provider.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {provider.whatsapp && (
                    <div className="flex items-center gap-4 group">
                      <div className="bg-green-500/10 text-green-600 p-3 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">WhatsApp</p>
                        <a
                          href={`https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-bold hover:text-green-600 truncate block transition-colors"
                        >
                          {provider.whatsapp}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-8" />

                <div className="space-y-3">
                  <Button className="w-full gap-2 font-bold shadow-lg" size="lg" asChild>
                    <a href={`tel:${provider.phone}`}>
                      <Phone className="h-4 w-4" />
                      Call Now
                    </a>
                  </Button>
                  {provider.whatsapp && (
                    <Button
                      variant="outline"
                      className="w-full gap-2 font-bold border-green-500/50 text-green-600 hover:bg-green-500/5 hover:text-green-700 h-12"
                      asChild
                    >
                      <a
                        href={`https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp Message
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            {provider.social_links && Object.values(provider.social_links).some(link => !!link) && (
              <Card className="border-muted/50 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-muted-foreground">Social Presence</h3>
                  <div className="flex gap-3">
                    {provider.social_links.facebook && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
                        asChild
                      >
                        <a
                          href={provider.social_links.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Facebook"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {provider.social_links.instagram && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-xl hover:bg-pink-600 hover:text-white transition-all duration-300 shadow-sm"
                        asChild
                      >
                        <a
                          href={provider.social_links.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Instagram"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {provider.social_links.linkedin && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-xl hover:bg-blue-700 hover:text-white transition-all duration-300 shadow-sm"
                        asChild
                      >
                        <a
                          href={provider.social_links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <Card className="bg-muted/30 border-none shadow-none">
              <CardContent className="p-6">
                <h3 className="font-bold text-xs mb-2 uppercase tracking-widest text-primary">Service Area</h3>
                <p className="text-sm text-muted-foreground mb-6 font-medium">
                  Available for bookings in <strong>{provider.location}</strong> district and surrounding areas.
                </p>
                <h3 className="font-bold text-xs mb-2 uppercase tracking-widest text-primary">Member Status</h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Verified professional since {new Date(provider.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
