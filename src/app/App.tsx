import { AppShell } from "@/components/layout/AppShell";
import { SandboxProvider } from "@/lib/sandbox/sandboxState";
import { AppSettingsProvider } from "@/lib/storage/localStorage";
import { WorkspaceProvider } from "@/lib/workspace/workspaceState";

export default function App() {
  return (
    <AppSettingsProvider>
      <SandboxProvider>
        <WorkspaceProvider>
          <AppShell />
        </WorkspaceProvider>
      </SandboxProvider>
    </AppSettingsProvider>
  );
}
