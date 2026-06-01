import { AppShell } from "@/components/layout/AppShell";
import { AppSettingsProvider } from "@/lib/storage/localStorage";

export default function App() {
  return (
    <AppSettingsProvider>
      <AppShell />
    </AppSettingsProvider>
  );
}
