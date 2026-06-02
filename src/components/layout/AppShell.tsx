import { CurrentRoute } from "@/app/router";
import { IntendedUseModal } from "@/components/safety/IntendedUseModal";
import { Sidebar } from "@/components/layout/Sidebar";
import { ScenarioContinuityRail } from "@/components/layout/ScenarioContinuityRail";
import { TopBar } from "@/components/layout/TopBar";

export function AppShell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopBar />
        <ScenarioContinuityRail />
      <main className="mx-auto w-full max-w-[1800px] px-4 py-5 lg:px-6 2xl:px-8">
          <CurrentRoute />
        </main>
      </div>
      <IntendedUseModal />
    </div>
  );
}
