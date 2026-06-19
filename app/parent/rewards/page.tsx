"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Reward = {
  _id: string;
  title: string;
  description: string;
  pointsCost: number;
  active: boolean;
};

export default function RewardsManager() {
  const rewards = useQuery(api.rewards.listAll);
  const create = useMutation(api.rewards.create);
  const update = useMutation(api.rewards.update);
  const redemptions = useQuery(api.rewards.listRedemptions);
  const approve = useMutation(api.rewards.approveRedemption);

  const [draft, setDraft] = useState({ title: "", description: "", pointsCost: 100 });
  const [busy, setBusy] = useState(false);
  const [editCost, setEditCost] = useState<Record<string, number>>({});

  const add = async () => {
    if (!draft.title.trim()) return;
    setBusy(true);
    try {
      await create({ ...draft, rewardType: "custom" });
      setDraft({ title: "", description: "", pointsCost: 100 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Reward Manager</h1>
        <p className="text-sm text-muted-foreground">Create rewards, set costs and approve redemptions.</p>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">New reward</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label className="mb-1 text-xs text-muted-foreground">Title</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1 text-xs text-muted-foreground">Points cost</Label>
            <Input type="number" value={draft.pointsCost} onChange={(e) => setDraft({ ...draft, pointsCost: Number(e.target.value) })} />
          </div>
          <div className="flex items-end">
            <Button onClick={add} disabled={busy} className="w-full bg-blue-500 text-white hover:bg-blue-400">
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
            {(rewards ?? []).map((r: Reward) => (
              <tr key={r._id} className="border-t border-white/5">
                <td className="p-4">
                  <p className="font-medium text-white">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </td>
                <td className="p-4">
                  <Input
                    type="number"
                    value={editCost[r._id] ?? r.pointsCost}
                    onChange={(e) => setEditCost({ ...editCost, [r._id]: Number(e.target.value) })}
                    className="w-24"
                  />
                </td>
                <td className="p-4">
                  <Badge variant={r.active ? "default" : "secondary"}>
                    {r.active ? "active" : "hidden"}
                  </Badge>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      update({
                        rewardId: r._id as never,
                        title: r.title,
                        description: r.description,
                        pointsCost: editCost[r._id] ?? r.pointsCost,
                        active: !r.active,
                      })
                    }
                  >
                    {r.active ? "Hide" : "Show"}
                  </Button>
                </td>
              </tr>
            ))}
            {rewards !== undefined && rewards.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No rewards yet — add one above.
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
                <td className="p-4 font-mono text-xs text-muted-foreground">{r.rewardId.slice(-8)}</td>
                <td className="p-4 text-yellow-300">{r.pointsSpent}</td>
                <td className="p-4 capitalize">{r.status}</td>
                <td className="p-4 text-right">
                  {r.status === "requested" && (
                    <Button variant="outline" size="sm" onClick={() => approve({ redemptionId: r._id })}>
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

      <div className="text-right">
        <span className="text-xs text-muted-foreground"><Trash2 className="inline" size={12} /> Delete is admin-only in the dashboard.</span>
      </div>
    </div>
  );
}
