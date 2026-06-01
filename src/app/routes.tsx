import { HomePage } from "@/modules/workspace/HomePage";
import { WorkspacePage } from "@/modules/workspace/WorkspacePage";
import { KnowledgeGraphPage } from "@/modules/knowledge-graph/KnowledgeGraphPage";
import { SimulationStudioPage } from "@/modules/simulation-studio/SimulationStudioPage";
import { InterventionsPage } from "@/modules/interventions/InterventionsPage";
import { ReportsPage } from "@/modules/reports/ReportsPage";
import { SettingsPage } from "@/modules/settings/SettingsPage";

export const routes = [
  { path: "/", element: <HomePage /> },
  { path: "/workspace", element: <WorkspacePage /> },
  { path: "/knowledge-graph", element: <KnowledgeGraphPage /> },
  { path: "/simulation-studio", element: <SimulationStudioPage /> },
  { path: "/interventions", element: <InterventionsPage /> },
  { path: "/reports", element: <ReportsPage /> },
  { path: "/settings", element: <SettingsPage /> }
];
