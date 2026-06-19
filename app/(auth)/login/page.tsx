"use client";

import { useEffect, useState } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { Rocket, Loader2, Shield, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  const ensure = useMutation(api.userProfiles.ensureMine);
  const setRole = useMutation(api.userProfiles.setMyRole);
  const router = useRouter();

  // The role the user asked to enter as; fulfilled once auth is ready.
  const [pendingRole, setPendingRole] = useState<"parent" | "student" | null>(null);

  // When authentication completes, finish claiming the chosen role.
  useEffect(() => {
    if (!isAuthenticated || !pendingRole) return;
    (async () => {
      try {
        await ensure({ displayName: pendingRole === "parent" ? "Parent" : "Student" });
        await setRole({ role: pendingRole });
        router.push(pendingRole === "parent" ? "/parent/dashboard" : "/dashboard");
      } catch (e) {
        console.error(e);
        setPendingRole(null);
      }
    })();
  }, [isAuthenticated, pendingRole, ensure, setRole, router]);

  const enter = (role: "parent" | "student") => {
    setPendingRole(role);
    if (!isAuthenticated) {
      void signIn("anonymous");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-app p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/20 shadow-[0_0_24px_rgba(59,130,246,0.4)]">
          <Rocket size={26} className="text-blue-300" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          Homeschool<span className="text-blue-400">Hero</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {pendingRole
            ? "Signing you in…"
            : "Choose how you want to sign in."}
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={pendingRole !== null || isLoading}
            onClick={() => enter("parent")}
            className="flex w-full items-center gap-3 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition hover:bg-blue-400 disabled:opacity-60"
          >
            {pendingRole === "parent" ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
            Enter as Parent
          </button>
          <button
            type="button"
            disabled={pendingRole !== null || isLoading}
            onClick={() => enter("student")}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            {pendingRole === "student" ? <Loader2 size={18} className="animate-spin" /> : <GraduationCap size={18} />}
            Enter as Student
          </button>
        </div>

        <p className="mt-6 text-[11px] text-muted-foreground">
          Dev sign-in uses anonymous auth. Role assignment will be locked down
          with real accounts in a later phase.
        </p>
      </div>
    </main>
  );
}
