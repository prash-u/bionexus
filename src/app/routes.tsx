import { HomePage } from "@/modules/workspace/HomePage";
import { BodySandboxPage } from "@/modules/body-sandbox/BodySandboxPage";
import { ReportsPage } from "@/modules/reports/ReportsPage";
import { SettingsPage } from "@/modules/settings/SettingsPage";

export const routes = [
  { path: "/", element: <HomePage /> },
  { path: "/body-sandbox", element: <BodySandboxPage /> },
  { path: "/workspace", element: <BodySandboxPage /> },
  { path: "/body-atlas", element: <BodySandboxPage /> },
  { path: "/neural-circuit", element: <BodySandboxPage /> },
  { path: "/knowledge-graph", element: <BodySandboxPage /> },
  { path: "/simulation-studio", element: <BodySandboxPage /> },
  { path: "/interventions", element: <BodySandboxPage /> },
  { path: "/reports", element: <ReportsPage /> },
  { path: "/settings", element: <SettingsPage /> }
];
