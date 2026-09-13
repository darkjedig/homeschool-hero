"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { CheckCircle2, Loader2, Pencil, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RewardDraft = { title: string; description: string; pointsCost: number };

const emptyDraft: RewardDraft = { title: "", description: "", pointsCost: 100 };

export default function RewardsManager() {
  const rewards = useQuery(api.rewards.listAll);
  const create = useMutation(api.rewards.create);
  const update = useMutation(api.rewards.update);
  const redemptions = useQuery(api.rewards.listRedemptions);
  const approve = useMutation(api.rewards.approveRedemption);

  const [draft, setDraft] = useState<RewardDraft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Doc<"rewards"> | null>(null);
  const [editForm, setEditForm] = useState<RewardDraft>(emptyDraft);
  const [savingEdit, setSavingEdit] = useState(false);

  const add = async () => {
    if (!draft.title.trim()) return;
    setBusy(true);
    setError("");
    try {
      await create({ ...draft, rewardType: "custom" });
      setDraft(emptyDraft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add that reward.");
    } finally {
      setBusy(false);
    }
  };

  const openEdit = (reward: Doc<"rewards">) => {
    setEditing(reward);
    setEditForm({
      title: reward.title,
      description: reward.description,
      pointsCost: reward.pointsCost,
    });
    setError("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    setError("");
    try {
      await update({
        rewardId: editing._id,
        title: editForm.title,
        description: editForm.description,
        pointsCost: editForm.pointsCost,
        active: editing.active,
      });
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that reward.");
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleActive = async (reward: Doc<"rewards">) => {
    setError("");
    try {
      await update({
        rewardId: reward._id,
        title: reward.title,
        description: reward.description,
        pointsCost: reward.pointsCost,
        active: !reward.active,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update that reward.");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Reward Manager</h1>
        <p className="text-sm text-muted-foreground">Create rewards, edit costs and approve redemptions.</p>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">New reward</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label className="mb-1 text-xs text-muted-foreground">Title</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1 text-xs text-muted-foreground">Points cost</Label>
            <Input
              type="number"
              min={1}
              value={draft.pointsCost}
              onChange={(e) => setDraft({ ...draft, pointsCost: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={() => void add()} disabled={busy} className="w-full bg-blue-500 text-white hover:bg-blue-400">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add
            </Button>
          </div>
          <div className="md:col-span-4">
            <Label className="mb-1 text-xs text-muted-foreground">Description</Label>
            <Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5">
        <div className="border-b border-white/5 p-4 text-sm font-semibold text-white">Rewards</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted-foreground">
              <th className="p-4">Reward</th>
              <th className="p-4">Cost</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {(rewards ?? []).map((r) => (
              <tr key={r._id} className="border-t border-white/5">
                <td className="p-4">
                  <p className="font-medium text-white">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </td>
                <td className="p-4 text-yellow-300">{r.pointsCost}</td>
                <td className="p-4">
                  <Badge variant={r.active ? "default" : "secondary"}>
                    {r.active ? "active" : "hidden"}
                  </Badge>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => void toggleActive(r)}>
                    {r.active ? "Hide" : "Show"}
                  </Button>
                </td>
              </tr>
            ))}
            {rewards !== undefined && rewards.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No rewards yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5">
        <div className="border-b border-white/5 p-4 text-sm font-semibold text-white">Redemption requests</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted-foreground">
              <th className="p-4">Reward</th>
              <th className="p-4">Spent</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {(redemptions ?? []).map((r) => (
              <tr key={r._id} className="border-t border-white/5">
                <td className="p-4 font-medium text-white">{r.rewardTitle}</td>
                <td className="p-4 text-yellow-300">{r.pointsSpent}</td>
                <td className="p-4 capitalize">{r.status}</td>
                <td className="p-4 text-right">
                  {r.status === "requested" && (
                    <Button variant="outline" size="sm" onClick={() => void approve({ redemptionId: r._id })}>
                      <CheckCircle2 size={14} /> Approve
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {redemptions !== undefined && redemptions.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No redemption requests yet.
                </td>
              </tr>
            )}
            {redemptions === undefined && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  Sign in as parent to view redemptions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit reward</DialogTitle>
            <DialogDescription>Change the name, description or points cost. Hudson sees this in the shop.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="mb-1 text-xs text-muted-foreground">Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label className="mb-1 text-xs text-muted-foreground">Description</Label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div>
              <Label className="mb-1 text-xs text-muted-foreground">Points cost</Label>
              <Input
                type="number"
                min={1}
                value={editForm.pointsCost}
                onChange={(e) => setEditForm({ ...editForm, pointsCost: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button
              onClick={() => void saveEdit()}
              disabled={savingEdit || !editForm.title.trim()}
              className="bg-blue-500 text-white hover:bg-blue-400"
            >
              {savingEdit ? <Loader2 size={16} className="animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
