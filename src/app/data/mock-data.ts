export const categories = [
  { id: "plumber", name: "Plumber", icon: "wrench" },
  { id: "electrician", name: "Electrician", icon: "zap" },
  { id: "ac-repair", name: "AC Repair", icon: "wind" },
  { id: "cctv", name: "CCTV Expert", icon: "shield-check" },
];

export const sriLankanDistricts = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];

export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  description: string;
  skills: string[];
  location: string;
  phone: string;
  email: string;
  whatsapp?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  image?: string;
  rating?: number;
  featured?: boolean;
  createdAt: string;
}

export const mockServiceProviders: ServiceProvider[] = [
  {
    id: "1",
    name: "Sunil Perera",
    category: "plumber",
    description: "Professional plumbing services with 15+ years of experience. Specializing in residential and commercial plumbing repairs, installations, and maintenance.",
    skills: ["Pipe Repair", "Bathroom Installation", "Water Heater Service", "Drain Cleaning"],
    location: "Colombo",
    phone: "+94 77 123 4567",
    email: "sunil.perera@email.com",
    whatsapp: "+94771234567",
    rating: 4.8,
    featured: true,
    createdAt: "2026-01-05",
  },
  {
    id: "2",
    name: "Nimal Silva",
    category: "electrician",
    description: "Licensed electrician providing safe and reliable electrical services. Available for emergency repairs and new installations.",
    skills: ["Wiring", "Circuit Breakers", "Lighting Installation", "Solar Panel Setup"],
    location: "Gampaha",
    phone: "+94 77 234 5678",
    email: "nimal.silva@email.com",
    whatsapp: "+94772345678",
    rating: 4.9,
    featured: true,
    createdAt: "2026-01-04",
  },
  {
    id: "3",
    name: "Kusal AC Solutions",
    category: "ac-repair",
    description: "Expert air conditioning repair and maintenance for all brands. Efficient cooling guaranteed with our prompt service.",
    skills: ["AC Gas Refilling", "Component Repair", "Leak Detection", "Routine Servicing"],
    location: "Kandy",
    phone: "+94 77 345 6789",
    email: "kusal.ac@email.com",
    rating: 4.7,
    featured: true,
    createdAt: "2026-01-03",
  },
  {
    id: "4",
    name: "SafeGuard CCTV",
    category: "cctv",
    description: "Advanced security camera installations and monitoring solutions. Keeping your home and business safe with cutting-edge technology.",
    skills: ["HD Camera Setup", "Remote Monitoring", "NVR Configuration", "System Maintenance"],
    location: "Colombo",
    phone: "+94 77 456 7890",
    email: "safeguard@email.com",
    rating: 4.9,
    featured: true,
    createdAt: "2026-01-02",
  },
];
