"use client";

import { useDeferredValue, useState } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SubjectIcon } from "@/components/shared/subject-icon";
import { BookOpen, Clock, Search, Star, CalendarDays, CheckCircle2 } from "lucide-react";

export default function LessonsIndex() {
  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState<Id<"subjects"> | "">("");
  const deferredSearch = useDeferredValue(search);
  const subjects = useQuery(api.subjects.list);
  const week = useQuery(api.calendar.getWeek, {});
  const { results, status, loadMore } = usePaginatedQuery(api.lessons.library, { search: deferredSearch, subjectId: subjectId || undefined }, { initialNumItems: 24 });
  const scheduled = week?.dates.flatMap(date => (week.days[date] ?? []).filter(e => e.lessonId)) ?? [];

  return <div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-white">Your <span className="text-cyan-400">Lessons</span></h1><p className="mt-2 text-sm text-muted-foreground">Pick something to explore, continue learning, or revisit a favourite.</p></div><Link href="/subjects" className="rounded-xl border border-cyan-400/25 px-4 py-2 text-sm text-cyan-300">Browse subjects →</Link></header>
    <section className="space-panel"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-semibold text-cyan-300"><CalendarDays size={18} /> This week’s learning</h2><Link href="/calendar" className="text-xs text-cyan-300">Full calendar →</Link></div>
      {week === undefined ? <p className="text-sm text-muted-foreground">Loading your schedule…</p> : scheduled.length === 0 ? <p className="text-sm text-muted-foreground">No lessons scheduled this week. Choose any available lesson below to get started.</p> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{scheduled.slice(0, 4).map(entry => <Link key={entry._id} href={`/lessons/${entry.lessonId}`} className="min-w-0 rounded-xl border border-white/10 bg-blue-950/30 p-3"><p className="text-xs text-cyan-300">{new Date(entry.date + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {entry.subjectName}</p><p className="mt-2 text-sm font-medium text-white">{entry.lessonTitle ?? "Open lesson"}</p>{entry.completed && <p className="mt-2 text-xs text-green-300">Completed ✓</p>}</Link>)}</div>}
    </section>
    <section aria-label="Lesson library" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search size={18} className="absolute left-3 top-3 text-muted-foreground" /><input aria-label="Search lesson titles" placeholder="Search lesson titles…" value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border border-white/15 bg-slate-950/50 py-2.5 pl-10 pr-4 text-sm text-white" /></div><select aria-label="Filter by subject" value={subjectId} onChange={e => setSubjectId(e.target.value as Id<"subjects"> | "")} className="rounded-xl border border-white/15 bg-slate-900 px-4 py-2.5 text-sm text-white"><option value="">All subjects</option>{subjects?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
      {status === "LoadingFirstPage" ? <div role="status" className="space-panel py-12 text-center text-muted-foreground">Loading lessons…</div> : results.length === 0 ? <div className="space-panel py-12 text-center"><BookOpen className="mx-auto mb-3 text-cyan-400" /><h2 className="font-semibold">{search || subjectId ? "No matching lessons" : "Your next adventure is on its way"}</h2><p className="mt-2 text-sm text-muted-foreground">{search || subjectId ? "Try a different title or subject." : "Lessons will appear here when your parent publishes them."}</p>{(search || subjectId) && <button onClick={() => { setSearch(""); setSubjectId(""); }} className="mt-4 text-sm text-cyan-300">Clear filters</button>}</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{results.map(lesson => <Link href={`/lessons/${lesson._id}`} key={lesson._id} className="space-panel group flex min-w-0 flex-col transition hover:border-cyan-400/50">
        <div className="mb-4 flex items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${lesson.subjectColor}22` }}><SubjectIcon slug={lesson.subjectSlug} iconName={lesson.subjectIcon} color={lesson.subjectColor} size={24} /></div><div className="min-w-0"><p className="text-xs font-semibold" style={{ color: lesson.subjectColor }}>{lesson.subjectName}</p><p className="mt-1 text-xs capitalize text-muted-foreground">{lesson.difficultyLevel} · {lesson.kind === "activity" ? "Activity" : "Lesson"}</p></div></div>
        <h2 className="text-base font-semibold leading-snug text-white group-hover:text-cyan-200">{lesson.title}</h2><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{lesson.description}</p>
        <div className="mb-4 mt-4 flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock size={14} /> {lesson.estimatedMinutes} min</span><span className="flex items-center gap-1 text-amber-300"><Star size={14} /> {lesson.pointsAwarded} points</span></div>
        <div className="mt-auto border-t border-white/10 pt-3"><div className="flex items-center justify-between text-xs"><span className={lesson.completed ? "text-green-300" : "text-cyan-300"}>{lesson.completed ? <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Review lesson</span> : lesson.progress > 0 ? "Continue lesson →" : "Start lesson →"}</span><span className="text-muted-foreground">{Math.round(lesson.progress)}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, Math.max(0, lesson.progress))}%` }} /></div></div>
      </Link>)}</div>}
      {(status === "CanLoadMore" || status === "LoadingMore") && <button disabled={status === "LoadingMore"} onClick={() => loadMore(24)} className="mx-auto block rounded-xl border border-cyan-400/30 px-6 py-3 text-sm text-cyan-300">{status === "LoadingMore" ? "Loading…" : "Load more lessons"}</button>}
    </section>
  </div>;
}
