import { HomePage } from "@/modules/workspace/HomePage";
import { BodySandboxPage } from "@/modules/body-sandbox/BodySandboxPage";
import { BodyAtlasPage } from "@/modules/body-atlas/BodyAtlasPage";
import { WorkspacePage } from "@/modules/workspace/WorkspacePage";
import { KnowledgeGraphPage } from "@/modules/knowledge-graph/KnowledgeGraphPage";
import { NeuralCircuitPage } from "@/modules/neural-circuit/NeuralCircuitPage";
import { SimulationStudioPage } from "@/modules/simulation-studio/SimulationStudioPage";
import { InterventionsPage } from "@/modules/interventions/InterventionsPage";
import { ReportsPage } from "@/modules/reports/ReportsPage";
import { SettingsPage } from "@/modules/settings/SettingsPage";

export const routes = [
  { path: "/", element: <HomePage /> },
  { path: "/body-sandbox", element: <BodySandboxPage /> },
  { path: "/workspace", element: <WorkspacePage /> },
  { path: "/body-atlas", element: <BodyAtlasPage /> },
  { path: "/neural-circuit", element: <NeuralCircuitPage /> },
  { path: "/knowledge-graph", element: <KnowledgeGraphPage /> },
  { path: "/simulation-studio", element: <SimulationStudioPage /> },
  { path: "/interventions", element: <InterventionsPage /> },
  { path: "/reports", element: <ReportsPage /> },
  { path: "/settings", element: <SettingsPage /> }
];
