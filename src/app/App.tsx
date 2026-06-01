import { AppShell } from "@/components/layout/AppShell";
import { AppSettingsProvider } from "@/lib/storage/localStorage";
import { WorkspaceProvider } from "@/lib/workspace/workspaceState";

export default function App() {
  return (
    <AppSettingsProvider>
      <WorkspaceProvider>
        <AppShell />
      </WorkspaceProvider>
    </AppSettingsProvider>
  );
}
