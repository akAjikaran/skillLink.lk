import { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { sriLankanDistricts } from "../data/mock-data";
import { CategoryIcon } from "./category-icon";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

interface CreateServicePageProps {
  onNavigate: (page: string, params?: any) => void;
  editId?: string;
}

export function CreateServicePage({ onNavigate, editId }: CreateServicePageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    description: "",
    location: "",
    phone: "",
    email: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    linkedin: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch Categories
  useEffect(() => {
    async function fetchCategories() {
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
    }
    fetchCategories();
  }, []);

  // Load service data if in edit mode
  useEffect(() => {
    async function loadService() {
      if (!editId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('service_providers')
          .select('*')
          .eq('id', editId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setFormData({
            name: data.name,
            category_id: data.category_id,
            description: data.description,
            location: data.location,
            phone: data.phone,
            email: data.email,
            whatsapp: data.whatsapp || "",
            facebook: data.social_links?.facebook || "",
            instagram: data.social_links?.instagram || "",
            linkedin: data.social_links?.linkedin || "",
          });
          setSkills(data.skills || []);
          setIsEditMode(true);
        }
      } catch (error) {
        console.error("Error loading service:", error);
        toast.error("Failed to load service data");
      } finally {
        setIsLoading(false);
      }
    }
    loadService();
  }, [editId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.category_id || !formData.description || !formData.location || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("You must be logged in to create a service profile.");
      }

      console.log("Current user ID:", user.id);

      // 1. Ensure a profile exists for this user in the 'profiles' table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn("Error checking profile:", profileError);
      }

      if (!profile) {
        console.log("Profile not found in 'profiles' table, creating one now...");
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id, 
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Service Provider"
          }]);
        
        if (createProfileError) {
          console.error("Failed to create profile record:", createProfileError);
          if (createProfileError.code === '23503') {
             throw new Error("Database Error: Your user account is not recognized by the profiles table. Please ensure you have run the latest SQL schema in Supabase.");
          }
        } else {
          console.log("Profile record created successfully.");
        }
      } else {
        console.log("Confirmed: Profile record exists.");
      }
      
      // 2. Prepare the service provider data
      const serviceData = {
        name: formData.name,
        category_id: formData.category_id,
        description: formData.description,
        location: formData.location,
        phone: formData.phone,
        email: formData.email,
        whatsapp: formData.whatsapp,
        skills: skills,
        social_links: {
          facebook: formData.facebook,
          instagram: formData.instagram,
          linkedin: formData.linkedin,
        },
        user_id: user.id
      };

      console.log("Attempting to save service_providers record:", serviceData);

      if (isEditMode && editId) {
        const { error } = await supabase
          .from('service_providers')
          .update(serviceData)
          .eq('id', editId);
        
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        toast.success("Service profile updated successfully!");
      } else {
        const { error } = await supabase
          .from('service_providers')
          .insert([serviceData]);
        
        if (error) {
          console.error("Insert error details:", error);
          // 23503 is Foreign Key Violation
          if (error.code === '23503') {
            const detail = error.detail || "";
            if (detail.includes("user_id")) {
              throw new Error("Database error: Your account is not fully synchronized with the service_providers table. Please ensure you have run the SQL schema in the Supabase SQL Editor.");
            } else if (detail.includes("category_id")) {
              throw new Error("Database error: The selected category was not found. Please refresh the page and try again.");
            }
          }
          throw error;
        }
        toast.success("Service profile created successfully!");
      }

      onNavigate("manageservices");
    } catch (error: any) {
      console.error("Final error in handleSubmit:", error);
      toast.error(error.message || "Failed to save service profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === formData.category_id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p>Loading form...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => onNavigate(isEditMode ? "manageservices" : "home")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">
            {isEditMode ? "Edit Service Profile" : "Create Your Service Profile"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update your service information to keep it accurate"
              : "Join our platform and connect with customers across Sri Lanka"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!showPreview ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card className="border-muted/50">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Tell us about your professional service</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      Service or Business Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g., Perera Plumbing Services"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <CategoryIcon icon={category.icon} className="h-4 w-4" />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your services, experience, and what makes you unique..."
                      rows={5}
                      required
                      className="resize-none"
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        Min 50 characters recommended
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formData.description.length} characters
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">
                      District <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select your district" />
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
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="border-muted/50">
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                  <CardDescription>Add specific skills to help customers find you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="e.g., Pipe Repair, Bathroom Installation"
                    />
                    <Button type="button" onClick={addSkill} variant="secondary">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="px-3 py-1.5 gap-2 text-sm">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg text-center border border-dashed">
                      No skills added yet. Add at least one skill to continue.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border-muted/50">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Verified contact details for potential customers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+94 77 123 4567"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
                    <Input
                      id="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                      placeholder="+94 77 123 4567"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="border-muted/50">
                <CardHeader>
                  <CardTitle>Social Presence</CardTitle>
                  <CardDescription>Links to your professional social media profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        type="url"
                        value={formData.facebook}
                        onChange={(e) => handleInputChange("facebook", e.target.value)}
                        placeholder="facebook.com/..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        type="url"
                        value={formData.instagram}
                        onChange={(e) => handleInputChange("instagram", e.target.value)}
                        placeholder="instagram.com/..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange("linkedin", e.target.value)}
                        placeholder="linkedin.com/in/..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  disabled={!formData.name || !formData.category_id || !formData.description || isSubmitting}
                  className="flex-1"
                >
                  Preview Listing
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    isEditMode ? "Update Profile" : "Create Profile"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            /* Preview Mode */
            <div className="space-y-6">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <CardTitle>Profile Preview</CardTitle>
                  <CardDescription>
                    Review how your profile will appear to the public
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-shrink-0 border border-primary/20">
                        <CategoryIcon icon={selectedCategory?.icon || "briefcase"} className="h-10 w-10" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold mb-1">{formData.name}</h2>
                        <Badge variant="secondary" className="font-semibold">
                          {selectedCategory?.name}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-lg border-b pb-2">Professional Summary</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{formData.description}</p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-lg border-b pb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="px-3 py-1">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg border-b pb-2">Location</h3>
                        <p className="flex items-center gap-2 text-muted-foreground font-medium">
                          📍 {formData.location}, Sri Lanka
                        </p>
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg border-b pb-2">Contact</h3>
                        <div className="space-y-2 text-muted-foreground font-medium">
                          <p>📞 {formData.phone}</p>
                          <p>✉️ {formData.email}</p>
                          {formData.whatsapp && <p>💬 WhatsApp Available</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Edit Details
                </Button>
                <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    isEditMode ? "Confirm Update" : "Publish Listing"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}