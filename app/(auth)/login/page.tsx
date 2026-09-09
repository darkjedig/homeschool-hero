"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { SpaceArt } from "@/components/shared/space-art";
import { GraduationCap, ShieldCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const profile = useQuery(api.userProfiles.getMine);
  const parentAccess = useQuery(api.userProfiles.hasParentAccess);
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [pending, setPending] = useState<"student" | "parent" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (pending && profile?.role === pending && (pending !== "parent" || parentAccess)) {
      router.replace(pending === "parent" ? "/parent/dashboard" : "/dashboard");
    }
  }, [pending, profile, parentAccess, router]);

  async function enter(role: "student" | "parent") {
    setError("");
    setPending(role);
    try {
      const result = await signIn("family", { role, ...(role === "parent" ? { pin } : {}) });
      if (!result.signingIn) throw new Error("Sign-in unsuccessful");
      setPin("");
    } catch {
      setPending(null);
      setError(role === "parent" ? "Could not unlock parent access. Check your PIN. After 5 incorrect attempts, wait 5 minutes before trying again." : "Could not sign in. Please try again.");
    }
  }

  return <main className="app-shell grid min-h-screen place-items-center p-5">
    <section className="space-panel w-full max-w-md !p-7 text-center">
      <SpaceArt kind="robot" className="mx-auto h-32 w-28" />
      <h1 className="text-2xl font-bold">Homeschool<span className="text-cyan-400">Hero</span></h1>
      <p className="mt-2 text-sm text-muted-foreground">A new adventure starts here.</p>
      <button disabled={pending !== null} onClick={() => void enter("student")} className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 px-5 py-4 font-semibold disabled:opacity-50">
        {pending === "student" ? <Loader2 className="animate-spin" /> : <GraduationCap />} Log in as Hudson
      </button>
      <p className="mt-2 text-xs text-muted-foreground">Your lessons, points and progress, ready to go.</p>
      <form className="mt-7 border-t border-white/10 pt-6" onSubmit={e => { e.preventDefault(); void enter("parent"); }}>
        <label htmlFor="parent-pin" className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold"><ShieldCheck size={18} className="text-cyan-300" /> Parent access</label>
        <input id="parent-pin" type="password" inputMode="numeric" autoComplete="off" pattern="[0-9]{4}" maxLength={4} required value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ""))} disabled={pending !== null} placeholder="4-digit PIN" className="w-full rounded-xl border border-blue-400/30 bg-slate-950/60 p-3 text-center text-lg tracking-widest text-white" />
        <button disabled={pending !== null || pin.length !== 4} className="mt-3 w-full rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-sm font-semibold text-cyan-200 disabled:opacity-50">{pending === "parent" ? "Unlocking…" : "Unlock parent dashboard"}</button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
    </section>
  </main>;
}
