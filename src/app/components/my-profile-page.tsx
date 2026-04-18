import { useState, useEffect } from "react";
import { Mail, MapPin, Calendar, Edit, Camera, Shield, LogOut, Loader2, Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface Profile {
  id: string;
  full_name: string;
  email?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  joinDate?: string;
}

interface MyProfilePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function MyProfilePage({ onNavigate }: MyProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Try to fetch profile
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // If profile doesn't exist, create it (synchronize with auth)
        if (error && error.code === 'PGRST116') {
          console.log("Profile record not found, creating default profile for user:", user.id);
          const defaultName = user.user_metadata?.full_name || user.email?.split('@')[0] || "New User";
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ 
              id: user.id, 
              full_name: defaultName,
              location: "Not set",
              bio: "No bio yet."
            }])
            .select()
            .single();

          if (createError) {
            console.error("Failed to create automatic profile:", createError);
            throw createError;
          }
          data = newProfile;
          toast.info("A default profile was created for you.");
        } else if (error) {
          throw error;
        }

        if (data) {
          setProfile({
            id: user.id,
            full_name: data.full_name || "New User",
            email: user.email,
            location: data.location || "Not set",
            bio: data.bio || "No bio yet.",
            avatar_url: data.avatar_url,
            joinDate: new Date(user.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          });
        }
      } catch (error: any) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data: " + (error.message || "Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          location: profile.location,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="font-medium">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to view and manage your professional profile.
          </p>
          <Button onClick={() => onNavigate("home")} className="w-full font-bold">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="border-b bg-gradient-to-b from-primary/10 to-transparent">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold">
                  {profile.full_name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-background">
                <Camera className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold tracking-tight">{profile.full_name}</h1>
                <Badge variant="secondary" className="w-fit mx-auto md:mx-0 font-semibold px-3 py-1">
                  Verified Provider
                </Badge>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Joined {profile.joinDate}</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setIsEditing(!isEditing)} 
              variant={isEditing ? "outline" : "default"} 
              className="gap-2 font-bold px-6"
            >
              <Edit className="h-4 w-4" />
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Personal Information</CardTitle>
                <CardDescription className="text-base font-medium">Update your personal details and how others see you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-bold">Full Name</Label>
                        <Input 
                          id="name" 
                          value={profile.full_name} 
                          onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2 opacity-60">
                        <Label htmlFor="email" className="font-bold">Email Address (Managed by Auth)</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={profile.email}
                          disabled
                          className="h-11 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="font-bold">Primary Location</Label>
                      <Input 
                        id="location" 
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        className="h-11"
                        placeholder="e.g., Colombo, Sri Lanka"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="font-bold">Professional Bio</Label>
                      <Input 
                        id="bio" 
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        className="h-11"
                        placeholder="Briefly describe your professional background"
                      />
                    </div>
                    <Button onClick={handleSave} className="w-full h-11 font-bold" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving Changes...
                        </>
                      ) : "Save Profile Changes"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Professional Bio</h4>
                      <p className="text-lg text-muted-foreground leading-relaxed italic">"{profile.bio}"</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-dashed">
                      <div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Languages</h4>
                        <p className="font-bold">English, Sinhala</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Response Rate</h4>
                        <p className="font-bold text-green-600">Excellent (Typically 1 hour)</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl font-bold">Account Security</CardTitle>
                <CardDescription className="font-medium">Manage your password and system security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-5 border rounded-xl hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2.5 rounded-lg">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">Security Password</p>
                      <p className="text-sm text-muted-foreground font-medium">Last updated recently</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="font-bold">Update</Button>
                </div>
                <div className="flex items-center justify-between p-5 border rounded-xl hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-2.5 rounded-lg">
                      <Shield className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-bold">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground font-medium">Not enabled yet</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="font-bold">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="shadow-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Dashboard Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                <Button 
                  variant="ghost" 
                  className="justify-start gap-3 h-12 font-bold hover:bg-primary/5 hover:text-primary rounded-xl" 
                  onClick={() => onNavigate("manageservices")}
                >
                  <Briefcase className="h-5 w-5" />
                  Manage My Services
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start gap-3 h-12 font-bold hover:bg-primary/5 hover:text-primary rounded-xl" 
                  onClick={() => onNavigate("create")}
                >
                  <Edit className="h-5 w-5" />
                  Add New Service Listing
                </Button>
                <div className="border-t border-dashed my-2 pt-4">
                  <Button variant="ghost" className="justify-start gap-3 h-12 text-destructive hover:text-white hover:bg-destructive font-bold w-full rounded-xl transition-all">
                    <LogOut className="h-5 w-5" />
                    Sign Out of ServiceHub
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative group">
              <div className="absolute inset-0 bg-white/10 group-hover:scale-110 transition-transform duration-500" />
              <CardContent className="p-8 relative">
                <h4 className="font-bold text-xl mb-3">Need Support?</h4>
                <p className="text-sm opacity-90 mb-6 font-medium leading-relaxed">
                  Our team is here to help you optimize your profile and reach more customers in Sri Lanka.
                </p>
                <Button variant="secondary" className="w-full font-bold h-11">Message Support</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
