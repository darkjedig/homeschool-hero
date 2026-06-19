"use client";

import { useEffect, useState } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { Rocket, Loader2, Shield, GraduationCap, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  const ensure = useMutation(api.userProfiles.ensureMine);
  const setRole = useMutation(api.userProfiles.setMyRole);
  const router = useRouter();

  // Avoid hydration mismatch: auth state differs between server and client.
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const [pendingRole, setPendingRole] = useState<"parent" | "student" | null>(
    null,
  );

  useEffect(() => {
    if (!isAuthenticated || !pendingRole) return;
    (async () => {
      try {
        await ensure({
          displayName: pendingRole === "parent" ? "Parent" : "Student",
        });
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
    if (!isAuthenticated) void signIn("anonymous");
  };

  const busy = pendingRole !== null || (mounted && isLoading);

  return (
    <main className="grid min-h-screen place-items-center bg-app p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md sm:p-10">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-blue-500/20 shadow-[0_0_28px_rgba(59,130,246,0.45)]">
          <Rocket size={30} className="text-blue-300" />
        </div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Homeschool<span className="text-blue-400">Hero</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {pendingRole ? "Signing you in…" : "Choose how you want to sign in."}
        </p>

        <div className="mt-8 space-y-4">
          <RoleButton
            label="Enter as Parent"
            description="Build lessons, track progress, manage rewards"
            icon={Shield}
            accent="#3b82f6"
            active
            loading={pendingRole === "parent"}
            disabled={busy}
            onClick={() => enter("parent")}
          />
          <RoleButton
            label="Enter as Student"
            description="Lessons, quizzes, points and rewards"
            icon={GraduationCap}
            accent="#a855f7"
            active={false}
            loading={pendingRole === "student"}
            disabled={busy}
            onClick={() => enter("student")}
          />
        </div>

        <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground">
          Dev sign-in uses anonymous auth. Role assignment will be locked down
          with real accounts in a later phase.
        </p>
      </div>
    </main>
  );
}

function RoleButton({
  label,
  description,
  icon: Icon,
  accent,
  active,
  loading,
  disabled,
  onClick,
}: {
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  active: boolean;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        "group flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition " +
        (active
          ? "border-transparent text-white shadow-[0_0_22px_rgba(59,130,246,0.4)] hover:brightness-110"
          : "border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10") +
        " disabled:cursor-not-allowed disabled:opacity-60"
      }
      style={
        active
          ? { backgroundColor: `${accent}`, borderColor: `${accent}` }
          : undefined
      }
    >
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
        style={{
          backgroundColor: active ? "rgba(255,255,255,0.18)" : `${accent}22`,
        }}
      >
        {loading ? (
          <Loader2 size={22} className="animate-spin text-white" />
        ) : (
          <Icon size={22} style={{ color: active ? "#fff" : accent }} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{label}</span>
        <span className="block text-xs text-white/70">{description}</span>
      </span>
      <ChevronRight
        size={18}
        className="shrink-0 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white/70"
      />
    </button>
  );
}
