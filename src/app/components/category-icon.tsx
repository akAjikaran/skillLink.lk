import {
  Wrench,
  Zap,
  Laptop,
  Palette,
  Sparkles,
  BookOpen,
  Scale,
  Stethoscope,
  Shirt,
  Briefcase,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  wrench: Wrench,
  zap: Zap,
  laptop: Laptop,
  palette: Palette,
  sparkles: Sparkles,
  "book-open": BookOpen,
  scale: Scale,
  stethoscope: Stethoscope,
  shirt: Shirt,
  briefcase: Briefcase,
};

interface CategoryIconProps {
  icon: string;
  className?: string;
}

export function CategoryIcon({ icon, className = "h-6 w-6" }: CategoryIconProps) {
  const Icon = iconMap[icon] || Briefcase;
  return <Icon className={className} />;
}
