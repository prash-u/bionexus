import {
  BrainCircuit,
  FileText,
  FlaskConical,
  Home,
  Network,
  ScanHeart,
  Settings,
  SlidersHorizontal,
  UserRoundSearch,
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
  { to: "/body-sandbox", label: "Body Sandbox", shortLabel: "Sandbox", description: "Configure state and observe body-scale consequences", icon: ScanHeart, primary: true },
  { to: "/workspace", label: "Workspace", shortLabel: "Workspace", description: "Reasoning notes, entities and hypotheses", icon: BrainCircuit },
  { to: "/body-atlas", label: "Body Atlas", shortLabel: "Atlas", description: "Inspect organs, systems and molecule-carrying edges", icon: UserRoundSearch },
  { to: "/neural-circuit", label: "Neural Circuit", shortLabel: "Neural", description: "Motor-circuit and stimulation module", icon: SlidersHorizontal },
  { to: "/knowledge-graph", label: "Knowledge Graph", shortLabel: "Graph", description: "Scenario pathways, relationships and imported networks", icon: Network },
  { to: "/interventions", label: "Interventions", shortLabel: "Interventions", description: "Exploratory modulators and perturbations", icon: FlaskConical },
  { to: "/reports", label: "Reports", shortLabel: "Reports", description: "Generate communication-ready outputs", icon: FileText },
  { to: "/settings", label: "Settings", shortLabel: "Settings", description: "Local preferences and intended-use controls", icon: Settings }
];
