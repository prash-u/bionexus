import {
  FileText,
  Home,
  ScanHeart,
  Settings,
  type LucideIcon
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  primary?: boolean;
}

export const navItems: NavItem[] = [
  { to: "/", label: "Home", shortLabel: "Home", description: "Product framing and preset launchpad", icon: Home },
  { to: "/body-sandbox", label: "Sandbox", shortLabel: "Sandbox", description: "Configure, observe, understand and perturb one biological state", icon: ScanHeart, primary: true },
  { to: "/reports", label: "Reports", shortLabel: "Reports", description: "Generate communication-ready outputs", icon: FileText },
  { to: "/settings", label: "Settings", shortLabel: "Settings", description: "Local preferences and intended-use controls", icon: Settings }
];
