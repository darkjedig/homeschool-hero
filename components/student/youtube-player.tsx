"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckCircle2, Loader2 } from "lucide-react";
import { formatClock } from "@/lib/utils";

declare global {
  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
function loadYouTubeAPI(): Promise<void> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<void>((resolve) => {
    if (typeof window === "undefined") return;
    if (window.YT && window.YT.Player) return resolve();
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
  });
  return apiPromise;
}

function youTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

/** YouTube IFrame player that reports per-second watch progress to Convex. */
export function YouTubePlayer({
  lessonId,
  videoUrl,
  onPercent,
}: {
  lessonId: string;
  videoUrl: string;
  onPercent?: (pct: number) => void;
}) {
  const videoId = youTubeId(videoUrl);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [ready, setReady] = useState(false);

  const progress = useQuery(api.videoProgress.getForLesson, {
    lessonId: lessonId as never,
  });
  const upsert = useMutation(api.videoProgress.upsert);
  const onPercentRef = useRef(onPercent);
  onPercentRef.current = onPercent;

  const report = async (p: YT.Player, completed = false) => {
    if (typeof p.getCurrentTime !== "function") return;
    const t = p.getCurrentTime() || 0;
    const dur = p.getDuration() || 0;
    if (dur <= 0 && t <= 0) return;
    const pct = dur > 0 ? Math.min(100, Math.round((t / dur) * 100)) : 0;
    onPercentRef.current?.(pct);
    try {
      await upsert({
        lessonId: lessonId as never,
        videoUrl,
        secondsWatched: Math.floor(t),
        lastTimestamp: Math.floor(t),
        percentageWatched: pct,
        durationSeconds: dur > 0 ? Math.round(dur) : undefined,
        completed: completed || pct >= 90,
      });
    } catch {
      // not authenticated yet during dev — ignore
    }
  };

  useEffect(() => {
    if (!videoId || !containerRef.current) return;
    let cancelled = false;

    loadYouTubeAPI().then(() => {
      if (cancelled || !window.YT || !containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: (e) => {
            setReady(true);
            if (progress?.lastTimestamp && progress.lastTimestamp > 3) {
              e.target.seekTo(progress.lastTimestamp, true);
            }
            intervalRef.current = setInterval(() => {
              const p = playerRef.current;
              if (!p || typeof p.getPlayerState !== "function") return;
              if (p.getPlayerState() !== window.YT!.PlayerState.PLAYING) return;
              void report(p);
            }, 2500);
          },
          onStateChange: (e) => {
            const p = playerRef.current;
            if (!p) return;
            if (e.data === window.YT!.PlayerState.ENDED) {
              void report(p, true);
            } else if (e.data === window.YT!.PlayerState.PAUSED) {
              void report(p);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      try {
        playerRef.current?.destroy?.();
      } catch {
        // noop
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  if (!videoId) {
    return (
      <div className="grid aspect-video place-items-center rounded-2xl border border-white/10 bg-white/5 text-sm text-muted-foreground">
        Add a valid YouTube URL to play this lesson.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
      {!ready && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-black/60 text-muted-foreground">
          <Loader2 size={22} className="animate-spin" />
        </div>
      )}
      <div ref={containerRef} className="aspect-video w-full" />
      {progress?.completed && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
          <CheckCircle2 size={14} /> Completed
        </div>
      )}
      {progress && (progress.secondsWatched > 0 || (progress.durationSeconds ?? 0) > 0) && (
        <div className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
          {formatClock(progress.secondsWatched)}
          {progress.durationSeconds
            ? ` / ${formatClock(progress.durationSeconds)}`
            : ""}
          {" · "}
          {progress.percentageWatched}%
        </div>
      )}
    </div>
  );
}
