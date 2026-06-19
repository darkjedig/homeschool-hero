"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LessonsManager() {
  const lessons = useQuery(api.lessons.listAll);
  const setStatus = useMutation(api.lessons.setStatus);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lessons</h1>
          <p className="text-sm text-muted-foreground">Publish, unpublish and review all lessons.</p>
        </div>
        <Link href="/parent/courses/new">
          <Button className="bg-blue-500 text-white hover:bg-blue-400">
            <Plus size={16} /> New course
          </Button>
        </Link>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-muted-foreground">
              <th className="p-4">Title</th>
              <th className="p-4">Difficulty</th>
              <th className="p-4">Points</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {(lessons ?? []).map((l) => (
              <tr key={l._id} className="border-t border-white/5">
                <td className="p-4 font-medium text-white">{l.title}</td>
                <td className="p-4 text-muted-foreground">{l.difficultyLevel}</td>
                <td className="p-4 text-yellow-300">{l.pointsAwarded}</td>
                <td className="p-4">
                  <Badge variant={l.status === "published" ? "default" : "secondary"}>
                    {l.status}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setStatus({
                        lessonId: l._id,
                        status: l.status === "published" ? "draft" : "published",
                      })
                    }
                  >
                    {l.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                </td>
              </tr>
            ))}
            {lessons !== undefined && lessons.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No lessons yet. Use the{" "}
                  <Link href="/parent/courses/new" className="text-blue-400 hover:underline">
                    course builder
                  </Link>{" "}
                  or{" "}
                  <Link href="/parent/lessons/new" className="text-blue-400 hover:underline">
                    add a single lesson
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
