"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { UserRound, LogOut, ShieldCheck } from "lucide-react";

export function AccountSettings() {
  const profile = useQuery(api.userProfiles.getMine);
  if (profile === undefined) return <div className="space-panel animate-pulse p-8">Loading your profile…</div>;
  if (!profile) return <section className="space-panel"><p>Log in to save your profile and learning preferences.</p><Link href="/login" className="mt-4 inline-block text-cyan-300">Choose your account →</Link></section>;
  return <ProfileForm key={profile._id} profile={profile} />;
}

function ProfileForm({ profile }: { profile: Doc<"userProfiles"> }) {
  const update = useMutation(api.userProfiles.updateMine);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [name, setName] = useState(profile.displayName);
  const [reducedMotion, setReducedMotion] = useState(profile.reducedMotion ?? false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return <section className="space-panel space-y-5">
    <div className="flex items-center gap-3"><UserRound className="text-cyan-300" /><div><h2 className="font-semibold">Your profile</h2><p className="text-xs text-muted-foreground">{profile.role === "parent" ? "Parent account" : "Hudson’s learning account"}</p></div></div>
    <form className="space-y-5" onSubmit={async e => { e.preventDefault(); setBusy(true); setMessage(""); setError(""); try { await update({ displayName: name, reducedMotion }); setMessage("Settings saved."); } catch { setError("Could not save your settings. Please try again."); } finally { setBusy(false); } }}>
      <div><label htmlFor="display-name" className="mb-2 block text-sm">Display name</label><input id="display-name" maxLength={40} required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-white/15 bg-slate-950/50 px-4 py-3 text-white" /><p className="mt-2 text-xs text-muted-foreground">Shown in your dashboard greeting and profile.</p></div>
      <label className="flex items-start gap-3 rounded-xl border border-white/10 p-4"><input type="checkbox" className="mt-1 accent-cyan-400" checked={reducedMotion} onChange={e => setReducedMotion(e.target.checked)} /><span><span className="block text-sm font-medium">Reduce motion</span><span className="text-xs text-muted-foreground">Keep the interface calmer by reducing animations.</span></span></label>
      <button disabled={busy || !name.trim()} className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save settings"}</button>
      {message && <p role="status" className="text-sm text-green-300">{message}</p>}{error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    </form>
    <div className="flex flex-wrap gap-4 border-t border-white/10 pt-5">
      <Link href="/login" className="flex items-center gap-2 text-sm text-cyan-300"><ShieldCheck size={17} /> Switch account</Link>
      <button disabled={busy} onClick={async () => { setBusy(true); setError(""); try { await signOut(); router.replace("/login"); } catch { setError("Could not sign out. Please try again."); setBusy(false); } }} className="flex items-center gap-2 text-sm text-muted-foreground"><LogOut size={17} /> Sign out</button>
    </div>
  </section>;
}
