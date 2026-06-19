"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

/**
 * Guards every parent page: only mounts the page (and its auth-required
 * queries) once the signed-in user is confirmed to have the parent role.
 * Otherwise shows a sign-in / role prompt — never crashes the page.
 */
export function ParentGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(api.userProfiles.getMine);

  if (isLoading || profile === undefined) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || profile === null) {
    return (
      <GateCard
        icon={<ShieldAlert size={26} className="text-orange-300" />}
        title="Sign in required"
        body="You need to be signed in as a parent to view the parent console."
      />
    );
  }

  if (profile.role !== "parent") {
    return (
      <GateCard
        icon={<ShieldAlert size={26} className="text-orange-300" />}
        title="Parent access only"
        body={`You're signed in as a ${profile.role}. Switch to a parent account to manage content.`}
      />
    );
  }

  return <>{children}</>;
}

function GateCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center p-6">
      <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-orange-500/15">
          {icon}
        </div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition hover:bg-blue-400"
        >
          <ShieldCheck size={18} /> Go to sign in
        </Link>
      </div>
    </div>
  );
}
