import { ArrowLeft, Star, MapPin, Phone, Mail, MessageCircle, Facebook, Instagram, Linkedin } from "lucide-react";
import { Button } from "./ui/button";
import { mockServiceProviders, categories } from "../data/mock-data";
import { CategoryIcon } from "./category-icon";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface ProfilePageProps {
  onNavigate: (page: string, params?: any) => void;
  providerId: string;
}

export function ProfilePage({ onNavigate, providerId }: ProfilePageProps) {
  const provider = mockServiceProviders.find((p) => p.id === providerId);

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Provider Not Found</h2>
          <Button onClick={() => onNavigate("browse")}>
            Browse All Services
          </Button>
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === provider.category);

  return (
    <div className="min-h-screen pb-12">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => onNavigate("browse")}
          className="gap-2"
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
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <CategoryIcon icon={category?.icon || "briefcase"} className="h-12 w-12" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div>
                        <h1 className="text-3xl mb-2">{provider.name}</h1>
                        <p className="text-lg text-muted-foreground">{category?.name}</p>
                      </div>
                      {provider.rating && (
                        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100 px-4 py-2 rounded-lg">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-lg">{provider.rating}</span>
                          <span className="text-sm text-yellow-700 dark:text-yellow-300">/ 5.0</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-5 w-5" />
                      <span>{provider.location}, Sri Lanka</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-xl mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {provider.description}
                </p>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-xl mb-4">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-4 py-2 text-sm">
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
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${provider.phone}`}
                        className="text-sm font-medium hover:underline truncate block"
                      >
                        {provider.phone}
                      </a>
                    </div>
                  </div>

                  {provider.email && (
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a
                          href={`mailto:${provider.email}`}
                          className="text-sm font-medium hover:underline truncate block"
                        >
                          {provider.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {provider.whatsapp && (
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 p-2 rounded-lg">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">WhatsApp</p>
                        <a
                          href={`https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:underline truncate block"
                        >
                          {provider.whatsapp}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <Button className="w-full gap-2" size="lg">
                    <Phone className="h-4 w-4" />
                    Call Now
                  </Button>
                  {provider.whatsapp && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      size="lg"
                      asChild
                    >
                      <a
                        href={`https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                  {provider.email && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      asChild
                    >
                      <a href={`mailto:${provider.email}`}>
                        <Mail className="h-4 w-4" />
                        Send Email
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            {provider.socialLinks && Object.keys(provider.socialLinks).length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Connect</h3>
                  <div className="flex gap-2">
                    {provider.socialLinks.facebook && (
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <a
                          href={provider.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Facebook"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {provider.socialLinks.instagram && (
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <a
                          href={provider.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Instagram"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      </Button>
                    )}
                    {provider.socialLinks.linkedin && (
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <a
                          href={provider.socialLinks.linkedin}
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
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This service provider operates in {provider.location} district.
                </p>
                <h3 className="font-semibold mb-2">Member Since</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(provider.createdAt).toLocaleDateString("en-US", {
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
