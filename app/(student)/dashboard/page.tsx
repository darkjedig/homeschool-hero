"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardHeader } from "@/components/student/dashboard-header";
import { StatCard } from "@/components/student/stat-card";
import { MissionCard } from "@/components/student/mission-card";
import { ContinueLearningCard } from "@/components/student/continue-learning-card";
import { FridayChallengeCard } from "@/components/student/friday-challenge-card";
import { OverallProgressChart } from "@/components/student/overall-progress-chart";
import { SubjectTile } from "@/components/student/subject-tile";
import { AchievementBadge } from "@/components/student/achievement-badge";
import { RewardShopStrip } from "@/components/student/reward-shop-strip";
import { HintCard } from "@/components/student/hint-card";
import {
  Coins,
  Flame,
  Shield,
  Target,
  Trophy,
  FlaskConical,
  ListChecks,
  Sunrise,
  LineChart,
} from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

const MISSION_TOPICS: Record<string, string> = {
  maths: "Fractions",
  english: "Grammar",
  science: "Solar System",
  history: "World War II",
};

const SUBJECT_PROGRESS: Record<string, number> = {
  maths: 72,
  english: 58,
  science: 64,
  history: 45,
  "ai-and-computer-science": 38,
  "game-development": 51,
  homemaking: 30,
  "building-and-construction": 22,
};

export default function DashboardPage() {
  const subjects = useQuery(api.subjects.list);
  const firstFour = (subjects ?? []).slice(0, 4);

  return (
    <>
      <DashboardHeader name="Hudson" />

      {/* Top row — 4 stat cards */}
      <section
        aria-label="Stats"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard
          icon={Coins}
          iconColor="#eab308"
          value="2,450"
          label="Points"
          sub="+150 this week"
          subColor="green"
        />
        <StatCard
          icon={Flame}
          iconColor="#f97316"
          value="7 Days"
          label="Current Streak"
          sub="Best: 12 days"
        />
        <StatCard
          icon={Shield}
          iconColor="#a855f7"
          value="12"
          label="Level · Explorer"
          progress={78}
        />
        <StatCard
          icon={Target}
          iconColor="#3b82f6"
          value="72%"
          label="Weekly Goal"
          sub="5 of 7 missions"
          progress={72}
        />
      </section>

      {/* Middle row — missions | continue learning | friday challenge */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <h2 className="mb-3 text-lg font-semibold text-white">
            Today&apos;s Missions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {firstFour.map((s, i) => (
              <MissionCard
                key={s._id}
                subjectSlug={s.slug}
                title={s.name}
                subTopic={MISSION_TOPICS[s.slug] ?? s.description}
                progress={[68, 52, 74, 48][i] ?? 50}
                points={[120, 100, 150, 130][i] ?? 100}
                href={`/subjects/${s.slug}`}
              />
            ))}
            {firstFour.length === 0 &&
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                />
              ))}
          </div>
        </div>

        <div className="xl:col-span-5">
          <h2 className="mb-3 text-lg font-semibold text-white">
            Continue Learning
          </h2>
          <ContinueLearningCard
            title="The Solar System"
            subject="Science"
            lessonNumber={4}
            totalLessons={8}
            progress={62}
            href="/subjects/science"
          />
        </div>

        <div className="xl:col-span-3">
          <h2 className="mb-3 text-lg font-semibold text-white">
            Friday Challenge
          </h2>
          <FridayChallengeCard />
        </div>
      </section>

      {/* Bottom row — 4 widgets */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <OverallProgressChart />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Core Subjects
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {(subjects ?? []).map((s: Doc<"subjects">) => (
              <SubjectTile
                key={s._id}
                slug={s.slug}
                name={s.name}
                progress={SUBJECT_PROGRESS[s.slug] ?? 40}
                href={`/subjects/${s.slug}`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
            Recent Achievements
          </h3>
          <div className="flex justify-between">
            <AchievementBadge icon={Flame} label="Streak Master" color="#f97316" />
            <AchievementBadge icon={FlaskConical} label="Science Star" color="#22c55e" />
            <AchievementBadge icon={ListChecks} label="Quiz Whiz" color="#3b82f6" />
            <AchievementBadge icon={Sunrise} label="Early Bird" color="#eab308" />
          </div>
        </div>

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

      {/* Footer widgets */}
      <section className="flex flex-wrap gap-4">
        <RewardShopStrip />
        <HintCard />
      </section>

      <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
        <Trophy size={14} className="text-yellow-400" />
        Placeholder values shown — live stats connect when the student account
        is active.
      </div>
    </>
  );
}
