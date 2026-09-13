"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { TeacherAppContext } from "@/lib/teacher-context";

type TeacherUiState = {
  context: TeacherAppContext;
  setContext: (ctx: TeacherAppContext | null) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const TeacherContext = createContext<TeacherUiState | null>(null);

function pageFromPath(pathname: string): string {
  if (pathname.startsWith("/lessons")) return "lesson";
  if (pathname.startsWith("/friday-quiz")) return "friday-quiz";
  if (pathname.startsWith("/quiz")) return "quiz";
  if (pathname.startsWith("/calendar")) return "calendar";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  return "other";
}

export function TeacherProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pageContext, setPageContext] = useState<TeacherAppContext | null>(null);
  const [open, setOpen] = useState(false);

  const setContext = useCallback((ctx: TeacherAppContext | null) => {
    setPageContext(ctx);
  }, []);

  const value = useMemo<TeacherUiState>(
    () => ({
      context: pageContext ?? { page: pageFromPath(pathname) },
      setContext,
      open,
      setOpen,
    }),
    [pageContext, setContext, open, pathname],
  );

  return <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>;
}

export function useTeacherContext(): TeacherUiState {
  const value = useContext(TeacherContext);
  if (!value) {
    throw new Error("useTeacherContext must be used inside TeacherProvider");
  }
  return value;
}

export function useSetTeacherContext(ctx: TeacherAppContext): void {
  const { setContext } = useTeacherContext();
  const key = JSON.stringify(ctx);
  useEffect(() => {
    setContext(JSON.parse(key) as TeacherAppContext);
    return () => setContext(null);
  }, [key, setContext]);
}
