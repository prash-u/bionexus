/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ComplexityLevel, UserMode } from "@/lib/ontology/types";

const keys = {
  intendedUseAcknowledged: "bionexus:intended-use-acknowledged",
  userMode: "bionexus:user-mode",
  complexityLevel: "bionexus:complexity-level",
  diseaseProgram: "bionexus:last-disease-program",
  sidebarCollapsed: "bionexus:sidebar-collapsed"
};

interface AppSettings {
  intendedUseAcknowledged: boolean;
  userMode: UserMode;
  complexityLevel: ComplexityLevel;
  diseaseProgramId: string;
  sidebarCollapsed: boolean;
  setIntendedUseAcknowledged: (value: boolean) => void;
  setUserMode: (value: UserMode) => void;
  setComplexityLevel: (value: ComplexityLevel) => void;
  setDiseaseProgramId: (value: string) => void;
  setSidebarCollapsed: (value: boolean) => void;
  resetAcknowledgement: () => void;
}

const AppSettingsContext = createContext<AppSettings | null>(null);

const read = <T extends string>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  return (window.localStorage.getItem(key) as T | null) ?? fallback;
};

const readBool = (key: string) =>
  typeof window !== "undefined" && window.localStorage.getItem(key) === "true";

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [intendedUseAcknowledged, setAcknowledgedState] = useState(() =>
    readBool(keys.intendedUseAcknowledged)
  );
  const [userMode, setUserModeState] = useState<UserMode>(() => read(keys.userMode, "student"));
  const [complexityLevel, setComplexityState] = useState<ComplexityLevel>(() =>
    read(keys.complexityLevel, "intermediate")
  );
  const [diseaseProgramId, setDiseaseProgramState] = useState<string>(() =>
    read(keys.diseaseProgram, "parkinsons-v0")
  );
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() =>
    readBool(keys.sidebarCollapsed)
  );

  const value = useMemo<AppSettings>(
    () => ({
      intendedUseAcknowledged,
      userMode,
      complexityLevel,
      diseaseProgramId,
      sidebarCollapsed,
      setIntendedUseAcknowledged(value) {
        window.localStorage.setItem(keys.intendedUseAcknowledged, String(value));
        setAcknowledgedState(value);
      },
      setUserMode(value) {
        window.localStorage.setItem(keys.userMode, value);
        setUserModeState(value);
      },
      setComplexityLevel(value) {
        window.localStorage.setItem(keys.complexityLevel, value);
        setComplexityState(value);
      },
      setDiseaseProgramId(value) {
        window.localStorage.setItem(keys.diseaseProgram, value);
        setDiseaseProgramState(value);
      },
      setSidebarCollapsed(value) {
        window.localStorage.setItem(keys.sidebarCollapsed, String(value));
        setSidebarCollapsedState(value);
      },
      resetAcknowledgement() {
        window.localStorage.removeItem(keys.intendedUseAcknowledged);
        setAcknowledgedState(false);
      }
    }),
    [complexityLevel, diseaseProgramId, intendedUseAcknowledged, sidebarCollapsed, userMode]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const value = useContext(AppSettingsContext);
  if (!value) throw new Error("useAppSettings must be used inside AppSettingsProvider");
  return value;
}
