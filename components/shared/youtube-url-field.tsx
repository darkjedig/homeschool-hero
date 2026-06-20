"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertTriangle, ExternalLink, Search } from "lucide-react";
import {
  getYouTubeId,
  isYouTubeSearchUrl,
  youTubeThumb,
  youTubeSearchQuery,
} from "@/lib/youtube";

/**
 * YouTube URL input with a live thumbnail preview, a clear warning when the
 * value is a search link (not playable), and — when empty — a clickable
 * suggestion to search YouTube using a query derived from the lesson.
 */
export function YoutubeUrlField({
  value,
  onChange,
  suggestion,
}: {
  value: string;
  onChange: (v: string) => void;
  /** A ready-made YouTube search URL (derived from lesson title/subject). */
  suggestion?: string;
}) {
  const videoId = getYouTubeId(value);
  const isSearch = isYouTubeSearchUrl(value);
  const searchQuery = youTubeSearchQuery(value);
  const thumb = videoId ? youTubeThumb(value) : null;
  const suggestionQuery = suggestion ? youTubeSearchQuery(suggestion) : null;

  return (
    <div>
      <Label className="mb-1 block text-xs text-muted-foreground">
        YouTube video URL
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
      />

      {videoId ? (
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-2">
          {thumb && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="Video preview" className="h-12 w-20 rounded object-cover" />
          )}
          <div className="text-xs text-green-300">
            <p className="flex items-center gap-1 font-semibold">
              <CheckCircle2 size={14} /> Valid video
            </p>
            <p className="font-mono text-[11px] text-green-300/80">ID: {videoId}</p>
          </div>
        </div>
      ) : isSearch ? (
        <div className="mt-2 rounded-lg border border-orange-500/40 bg-orange-500/10 p-3 text-xs text-orange-200">
          <p className="flex items-center gap-1 font-semibold">
            <AlertTriangle size={14} /> That&apos;s a search link, not a video.
          </p>
          <p className="mt-1">
            {searchQuery
              ? `Search for "${searchQuery}" on YouTube, open the video, and paste its URL here.`
              : "Open the video on YouTube and paste its URL here."}
          </p>
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-semibold text-orange-300 hover:underline"
          >
            <Search size={12} /> Open the search <ExternalLink size={11} />
          </a>
        </div>
      ) : value ? (
        <p className="mt-2 flex items-center gap-1 text-xs text-orange-300">
          <AlertTriangle size={14} /> Not a recognised YouTube video URL.
        </p>
      ) : suggestion ? (
        <div className="mt-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-100">
          <p className="flex items-center gap-1 font-semibold">
            <Search size={13} /> Find a video for this lesson
          </p>
          <p className="mt-1">
            Search YouTube for{" "}
            <span className="font-semibold text-white">&ldquo;{suggestionQuery ?? "this topic"}&rdquo;</span>{" "}
            and paste the real video URL above.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href={suggestion}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-blue-500/25 px-2.5 py-1 font-semibold text-blue-100 hover:bg-blue-500/40"
            >
              <Search size={11} /> Open the search <ExternalLink size={11} />
            </a>
            <button
              type="button"
              onClick={() => onChange(suggestion)}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-semibold text-white hover:bg-white/10"
            >
              Use this search
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
