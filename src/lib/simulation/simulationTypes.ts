import type { SimulationState } from "@/lib/ontology/types";

export interface SimulationScenario extends SimulationState {
  accent: "cyan" | "violet" | "emerald" | "amber";
}
