import { HomePage } from "@/modules/workspace/HomePage";
import { BodySandboxPage } from "@/modules/body-sandbox/BodySandboxPage";
import { ReportsPage } from "@/modules/reports/ReportsPage";
import { SettingsPage } from "@/modules/settings/SettingsPage";

export const routes = [
  { path: "/", element: <HomePage /> },
  { path: "/body-sandbox", element: <BodySandboxPage /> },
  { path: "/workspace", element: <BodySandboxPage /> },
  { path: "/body-atlas", element: <BodySandboxPage initialView="body" /> },
  { path: "/neural-circuit", element: <BodySandboxPage initialView="activity" /> },
  { path: "/knowledge-graph", element: <BodySandboxPage initialView="knowledge" /> },
  { path: "/simulation-studio", element: <BodySandboxPage initialView="activity" /> },
  { path: "/interventions", element: <BodySandboxPage initialView="intervention" /> },
  { path: "/reports", element: <ReportsPage /> },
  { path: "/settings", element: <SettingsPage /> }
];
