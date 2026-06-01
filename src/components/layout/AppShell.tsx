import { CurrentRoute } from "@/app/router";
import { IntendedUseModal } from "@/components/safety/IntendedUseModal";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export function AppShell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          <CurrentRoute />
        </main>
      </div>
      <IntendedUseModal />
    </div>
  );
}
