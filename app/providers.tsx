"use client";

import { MotionConfig } from "framer-motion";
import { api } from "@/convex/_generated/api";
import { ConvexReactClient, useQuery } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import type { ReactNode } from "react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string,
);

export function Providers({ children }: { children: ReactNode }) {
  return <ConvexAuthProvider client={convex}><Preferences>{children}</Preferences></ConvexAuthProvider>;
}

function Preferences({ children }: { children: ReactNode }) {
  const profile = useQuery(api.userProfiles.getMine);
  return <MotionConfig reducedMotion={profile?.reducedMotion ? "always" : "user"}><div className={profile?.reducedMotion ? "reduce-motion contents" : "contents"}>{children}</div></MotionConfig>;
}
