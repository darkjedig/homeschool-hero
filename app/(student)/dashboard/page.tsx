"use client";

import styles from "@/components/student/core-subject-card.module.css";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardHeader } from "@/components/student/dashboard-header";
import { StatCard } from "@/components/student/stat-card";
import { MissionCard } from "@/components/student/mission-card";
import { ContinueLearningCard } from "@/components/student/continue-learning-card";
import { FridayChallengeCard } from "@/components/student/friday-challenge-card";
import { OverallProgressChart } from "@/components/student/overall-progress-chart";
import Link from "next/link";
import { SubjectIcon } from "@/components/shared/subject-icon";
import { hexToRgb, subjectMeta } from "@/lib/subjects";
import { AchievementBadge } from "@/components/student/achievement-badge";
import { RewardShopStrip } from "@/components/student/reward-shop-strip";
import { HintCard } from "@/components/student/hint-card";
import { RecommendedReview } from "@/components/student/recommended-review";
import { StaggerGroup, StaggerItem } from "@/components/shared/motion";
import { DynamicIcon } from "@/components/shared/icon-picker";
import {
  Coins,
  Flame,
  Shield,
  Target,
  Coffee,
  FlaskConical,
  ListChecks,
  Sunrise,
  LineChart,
} from "lucide-react";

export default function DashboardPage() {
  const overview = useQuery(api.dashboard.studentOverview);
  const today = useQuery(api.calendar.getToday);
  const myBadges = useQuery(api.badges.mine);
  const profile = useQuery(api.userProfiles.getMine);

  const missions = (today ?? []).slice(0, 4);
  const subjectProgress = overview?.subjectProgress ?? [];
  const cont = overview?.continueLearning ?? null;
  const firstName = (profile?.displayName ?? "there").split(" ")[0];

  return (
    <StaggerGroup className="student-dashboard space-y-4">
      <DashboardHeader name={firstName} points={overview?.points} badges={myBadges?.length} />

      {/* Top row — 4 stat cards */}
      <StaggerItem>
        <section
          aria-label="Stats"
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          <StatCard
          icon={Coins}
          iconColor="#eab308"
          value={overview ? overview.points.toLocaleString() : "—"}
          label="Points"
          sub={overview ? `+${overview.pointsThisWeek} this week` : undefined}
          subColor="green"
        />
        <StatCard
          icon={Flame}
          iconColor="#f97316"
          value={
            overview
              ? `${overview.streak} ${overview.streak === 1 ? "Day" : "Days"}`
              : "—"
          }
          label="Current Streak"
          sub={overview ? `Best: ${overview.bestStreak} days` : undefined}
        />
        <StatCard
          icon={Shield}
          iconColor="#a855f7"
          value={overview ? String(overview.level) : "—"}
          label={overview ? `Level · ${overview.levelTitle}` : "Level"}
          progress={overview?.levelProgress}
        />
        <StatCard
          icon={Target}
          iconColor="#3b82f6"
          value={overview ? `${overview.weeklyGoalPct}%` : "—"}
          label="Weekly Goal"
          sub={
            overview
              ? `${overview.weeklyDone} of ${overview.weeklyPlanned} missions`
              : undefined
          }
          progress={overview?.weeklyGoalPct}
        />
      </section>
      </StaggerItem>

      {/* Middle row — missions | continue learning | friday challenge */}
      <StaggerItem>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-panel mission-panel xl:col-span-5">
          <h2 className="mb-3 text-base font-semibold text-cyan-300">
            Today&apos;s Missions
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
            {missions.map((m) => (
              <MissionCard
                key={m._id}
                subjectSlug={m.subjectSlug}
                title={m.subjectName}
                subTopic={m.lessonTitle ?? m.label ?? "Practice"}
                progress={m.completed ? 100 : m.progress ?? 0}
                points={m.points ?? 0}
                href={m.lessonId ? `/lessons/${m.lessonId}` : `/subjects/${m.subjectSlug}`}
                iconName={m.subjectIcon ?? undefined}
                color={m.subjectColor}
              />
            ))}
            {today === undefined &&
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                />
              ))}
            {today !== undefined && missions.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                <Coffee size={24} className="text-orange-300" />
                <p className="text-sm font-medium text-white">
                  No missions scheduled for today
                </p>
                <p className="text-xs text-muted-foreground">
                  Enjoy the break — or pick something to learn from your subjects.
                </p>
                <Link
                  href="/subjects"
                  className="mt-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  Browse subjects
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-panel learning-panel flex flex-col xl:col-span-3">
          <h2 className="mb-3 text-base font-semibold text-cyan-300">
            Continue Learning
          </h2>
          <ContinueLearningCard
            title={cont?.title ?? "Pick a lesson"}
            subject={cont?.subject ?? "—"}
            lessonNumber={cont?.lessonNumber ?? 0}
            totalLessons={cont?.totalLessons ?? 0}
            progress={cont?.progress ?? 0}
            href={cont?.href ?? "/subjects"}
          />
        </div>

        <div className="space-panel challenge-panel flex flex-col xl:col-span-4">
          <h2 className="mb-3 text-base font-semibold text-cyan-300">
            Friday Challenge
          </h2>
          <FridayChallengeCard
            title={overview?.friday?.title ?? "Friday Challenge"}
            subtitle={overview?.friday?.subtitle ?? "Weekly boss battle · 2× points"}
          />
        </div>
      </section>
      </StaggerItem>

      {/* Bottom row — 3 widgets */}
      <StaggerItem>
      <section className="dashboard-details grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OverallProgressChart
          lessons={overview?.overall.lessonsPct}
          quizzes={overview?.overall.quizzesPct}
          challenges={overview?.overall.challengesPct}
          badges={overview?.overall.badgesPct}
        />

<section aria-label="Core subjects" className="space-panel core-panel">
          <h2 className="mb-3 text-base font-semibold text-cyan-300">Core Subjects</h2>
          <div className={styles.subjectGrid}>
            {subjectProgress.map((s) => (
              <CoreSubjectCard
                key={s._id}
                slug={s.slug}
                name={s.name}
                progress={s.pct}
                href={`/subjects/${s.slug}`}
                iconName={s.icon}
                color={s.color}
              />
            ))}
          </div>
        </section>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
            Recent Achievements
          </h3>
          <div className="flex justify-between">
            {(myBadges ?? []).slice(0, 4).map((b) => (
              <AchievementBadge
                key={b._id}
                icon={(props) => <DynamicIcon name={b.icon} {...props} />}
                label={b.title}
                color="#eab308"
              />
            ))}
            {(myBadges ?? []).length === 0 && (
              <>
                <AchievementBadge icon={Flame} label="Locked" color="#475569" />
                <AchievementBadge icon={FlaskConical} label="Locked" color="#475569" />
                <AchievementBadge icon={ListChecks} label="Locked" color="#475569" />
                <AchievementBadge icon={Sunrise} label="Locked" color="#475569" />
              </>
            )}
          </div>
        </div>


      </section>
      </StaggerItem>

      {/* Adaptive recommended review (auto-hides when nothing is weak) */}
      <RecommendedReview />

      {/* Footer widgets */}
      <StaggerItem>
      <section className="dashboard-footer grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RewardShopStrip />
        <HintCard />
        <section className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <div>
            <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-blue-500/20">
              <LineChart size={20} className="text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Parent Insights</h3>
            <p className="text-sm text-muted-foreground">
              Track progress, watch time and quiz results.
            </p>
          </div>
          <a
            href="/parent/dashboard"
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Open Parent View
          </a>
        </section>
      </section>
      </StaggerItem>
    </StaggerGroup>
  );
}

/** Larger, non-truncating subject card for the Core Subjects band. */
function CoreSubjectCard({
  slug,
  name,
  progress,
  href,
  iconName,
  color,
}: {
  slug: string;
  name: string;
  progress: number;
  href: string;
  iconName?: string;
  color?: string;
}) {
  const meta = subjectMeta(slug);
  const accent = color || meta.color;
  const rgb = hexToRgb(accent);
  return (
    <Link
      href={href}
      className={styles.card}
      style={{ borderColor: `${accent}40`, boxShadow: `0 0 22px rgba(${rgb},0.12)` }}
    >
      <div
        className={styles.icon}
        style={{ backgroundColor: `${accent}22`, boxShadow: `0 0 14px ${accent}55` }}
      >
        <SubjectIcon slug={slug} iconName={iconName} color={accent} size={22} />
      </div>
      <p className={styles.name}>{name}</p>
      <p className={styles.progressLabel}>{progress}% complete</p>
      <div className={styles.progress}>
        <div style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: accent }} />
      </div>
    </Link>
  );
}
