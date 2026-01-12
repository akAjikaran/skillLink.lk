import { useState, useEffect } from "react";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
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
import { categories, sriLankanDistricts } from "../data/mock-data";
import { CategoryIcon } from "./category-icon";
import { toast } from "sonner";

interface CreateServicePageProps {
  onNavigate: (page: string, params?: any) => void;
  editId?: string;
}

export function CreateServicePage({ onNavigate, editId }: CreateServicePageProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
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

  // Load service data if in edit mode
  useEffect(() => {
    if (editId) {
      const stored = localStorage.getItem("myServices");
      if (stored) {
        try {
          const services = JSON.parse(stored);
          const serviceToEdit = services.find((s: any) => s.id === editId);
          if (serviceToEdit) {
            setFormData({
              name: serviceToEdit.name,
              category: serviceToEdit.category,
              description: serviceToEdit.description,
              location: serviceToEdit.location,
              phone: serviceToEdit.phone,
              email: serviceToEdit.email || "",
              whatsapp: serviceToEdit.whatsapp || "",
              facebook: serviceToEdit.facebook || "",
              instagram: serviceToEdit.instagram || "",
              linkedin: serviceToEdit.linkedin || "",
            });
            setSkills(serviceToEdit.skills || []);
            setIsEditMode(true);
          }
        } catch (error) {
          console.error("Error loading service:", error);
        }
      }
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.category || !formData.description || !formData.location || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }

    // Save to localStorage
    const newService = {
      id: editId || Date.now().toString(),
      ...formData,
      skills,
      createdAt: editId ? undefined : new Date().toISOString(),
    };

    const stored = localStorage.getItem("myServices");
    let services = [];
    
    if (stored) {
      try {
        services = JSON.parse(stored);
      } catch (error) {
        console.error("Error parsing services:", error);
      }
    }

    if (isEditMode && editId) {
      // Update existing service
      const existingService = services.find((s: any) => s.id === editId);
      services = services.map((s: any) => 
        s.id === editId ? { ...newService, createdAt: existingService?.createdAt || new Date().toISOString() } : s
      );
      toast.success("Service updated successfully!");
    } else {
      // Add new service
      services.push(newService);
      toast.success("Service profile created successfully!");
    }

    localStorage.setItem("myServices", JSON.stringify(services));
    
    setTimeout(() => {
      onNavigate("myprofile");
    }, 1500);
  };

  const selectedCategory = categories.find((c) => c.id === formData.category);

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => onNavigate(isEditMode ? "myprofile" : "home")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl mb-2">
            {isEditMode ? "Edit Service Profile" : "Create Your Service Profile"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update your service information"
              : "Join our platform and connect with customers across Sri Lanka"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!showPreview ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Tell us about your service</CardDescription>
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
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
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
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.description.length} characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="location">
                      Location <span className="text-destructive">*</span>
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
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                  <CardDescription>Add your skills and areas of expertise</CardDescription>
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
                    <Button type="button" onClick={addSkill} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="px-3 py-1 gap-2">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No skills added yet. Add at least one skill.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>How customers can reach you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
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

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
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
              <Card>
                <CardHeader>
                  <CardTitle>Social Media (Optional)</CardTitle>
                  <CardDescription>Connect your social profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="facebook">Facebook Profile URL</Label>
                    <Input
                      id="facebook"
                      type="url"
                      value={formData.facebook}
                      onChange={(e) => handleInputChange("facebook", e.target.value)}
                      placeholder="https://facebook.com/yourprofile"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram">Instagram Profile URL</Label>
                    <Input
                      id="instagram"
                      type="url"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange("instagram", e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange("linkedin", e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  disabled={!formData.name || !formData.category || !formData.description}
                  className="flex-1"
                >
                  Preview
                </Button>
                <Button type="submit" className="flex-1">
                  {isEditMode ? "Update Profile" : "Create Profile"}
                </Button>
              </div>
            </form>
          ) : (
            /* Preview */
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Preview</CardTitle>
                  <CardDescription>
                    This is how your profile will appear to customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-6 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <CategoryIcon icon={selectedCategory?.icon || "briefcase"} className="h-10 w-10" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl mb-1">{formData.name}</h2>
                        <p className="text-muted-foreground">{selectedCategory?.name}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-muted-foreground">{formData.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Skills & Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Contact Information</h3>
                      <div className="space-y-2 text-sm">
                        <p>📍 {formData.location}</p>
                        <p>📞 {formData.phone}</p>
                        {formData.email && <p>✉️ {formData.email}</p>}
                        {formData.whatsapp && <p>💬 {formData.whatsapp}</p>}
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
                >
                  Back to Edit
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  {isEditMode ? "Update Profile" : "Create Profile"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}