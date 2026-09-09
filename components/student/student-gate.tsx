"use client";

import { useEffect, type ReactNode } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";

/** Wait for authentication before mounting progress-writing student pages. */
export function StudentGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.userProfiles.getMine);
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || profile === null)) router.replace("/login");
  }, [isLoading, isAuthenticated, profile, router]);
  if (isLoading || !isAuthenticated || !profile) return <p role="status" className="p-8 text-muted-foreground">Opening your learning space…</p>;
  return <>{children}</>;
}
