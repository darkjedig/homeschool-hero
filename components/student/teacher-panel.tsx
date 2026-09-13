"use client";

import { useEffect, useRef } from "react";
import { Mic, Plus, Send, Volume2, VolumeX, X } from "lucide-react";
import { CosmoAvatar } from "@/components/shared/cosmo-avatar";
import { TEACHER_NAME, TEACHER_SUBTITLE } from "@/lib/teacher-name";
import type { TeacherAppContext } from "@/lib/teacher-context";
import { TeacherMarkdown } from "./teacher-markdown";

export type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function TeacherPanel({
  open,
  onClose,
  mobile,
  messages,
  suggestions,
  input,
  onInput,
  onSend,
  onSuggestion,
  onNewConversation,
  busy,
  listening,
  voiceMode,
  voiceEnabled,
  spokenEnabled,
  muted,
  speaking,
  onToggleMute,
  onToggleVoiceMode,
  error,
  reducedMotion,
  context,
}: {
  open: boolean;
  onClose: () => void;
  mobile: boolean;
  messages: ChatTurn[];
  suggestions: string[];
  input: string;
  onInput: (value: string) => void;
  onSend: () => void;
  onSuggestion: (text: string) => void;
  onNewConversation: () => void;
  busy: boolean;
  listening: boolean;
  voiceMode: boolean;
  voiceEnabled: boolean;
  spokenEnabled: boolean;
  muted: boolean;
  speaking: boolean;
  onToggleMute: () => void;
  onToggleVoiceMode: () => void;
  error: string | null;
  reducedMotion: boolean;
  context: TeacherAppContext;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, busy, listening, speaking]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const status = listening
    ? `${TEACHER_NAME} is listening… talk, then pause`
    : busy
      ? `${TEACHER_NAME} is thinking…`
      : speaking
        ? `${TEACHER_NAME} is speaking…`
        : voiceMode
          ? "Voice mode on"
          : null;

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="cosmo-title"
      className={
        mobile
          ? "flex h-full min-h-0 flex-col"
          : "flex h-full min-h-0 flex-col border-l border-white/10 bg-[#08111f]/95 shadow-[-20px_0_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      }
    >
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <CosmoAvatar className="h-11 w-11 shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 id="cosmo-title" className="text-base font-semibold text-white">
            {TEACHER_NAME}
          </h2>
          <p className="text-xs text-muted-foreground">{TEACHER_SUBTITLE}</p>
        </div>
        <button
          type="button"
          onClick={onNewConversation}
          className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-white"
          aria-label="New conversation"
        >
          <Plus size={16} />
        </button>
        {spokenEnabled && (
          <button
            type="button"
            onClick={onToggleMute}
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-white"
            aria-label={muted ? "Unmute spoken replies" : "Mute spoken replies"}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-white"
          aria-label={`Close ${TEACHER_NAME}`}
        >
          <X size={16} />
        </button>
      </header>

      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="grid place-items-center gap-3 py-8 text-center">
            <CosmoAvatar round={false} className="h-28 w-28" />
            <p className="max-w-xs text-sm text-slate-200">
              Hi, I’m {TEACHER_NAME}. Type a question, or turn on voice mode and talk to me like a
              teacher.
            </p>
          </div>
        )}
        {messages.map((turn) => (
          <div
            key={turn.id}
            className={turn.role === "user" ? "flex justify-end" : "flex items-end gap-2"}
          >
            {turn.role === "assistant" && (
              <CosmoAvatar className="mb-0.5 h-8 w-8 shrink-0" />
            )}
            {turn.role === "user" ? (
              <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-blue-500 px-3 py-2 text-sm text-white">
                {turn.content}
              </p>
            ) : (
              <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-white/8 px-3 py-2 text-sm text-slate-100">
                <TeacherMarkdown text={turn.content} />
              </div>
            )}
          </div>
        ))}
        {status && (
          <p role="status" className="text-xs text-cyan-300">
            {status}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="mx-4 mb-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {suggestions.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onSuggestion(chip)}
              disabled={busy}
              className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      <form
        className="border-t border-white/10 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        {voiceMode && (
          <p className="mb-2 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
            Voice mode on. Talk naturally, then pause. Tap the mic to switch off.
          </p>
        )}
        <label className="sr-only" htmlFor="cosmo-input">
          Message {TEACHER_NAME}
        </label>
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-black/30 p-2">
          {voiceEnabled && (
            <button
              type="button"
              onClick={onToggleVoiceMode}
              disabled={busy && !voiceMode}
              aria-pressed={voiceMode}
              aria-label={voiceMode ? "Turn voice mode off" : "Turn voice mode on"}
              className={
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl " +
                (voiceMode
                  ? "bg-cyan-500 text-white shadow-[0_0_16px_rgba(6,182,212,0.55)]"
                  : "bg-white/8 text-cyan-200 hover:bg-white/12") +
                (listening && !reducedMotion ? " animate-pulse" : "")
              }
            >
              <Mic size={18} />
            </button>
          )}
          <textarea
            id="cosmo-input"
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(event) => onInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            placeholder={
              listening
                ? "Listening… pause when you’re done"
                : voiceMode
                  ? "Voice on. You can still type…"
                  : voiceEnabled
                    ? "Ask, or tap the mic for voice mode…"
                    : `Ask ${TEACHER_NAME}…`
            }
            className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-sm text-white outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500 text-white shadow-[0_0_16px_rgba(59,130,246,0.45)] hover:bg-blue-400 disabled:opacity-40 [&_svg]:pointer-events-none"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-2 px-1 text-[10px] text-muted-foreground">
          {context.lessonTitle
            ? `Looking at: ${context.lessonTitle}`
            : voiceEnabled
              ? `${TEACHER_NAME} can talk with you. Turn on voice mode, or type.`
              : `${TEACHER_NAME} uses the page you’re on to help.`}
        </p>
      </form>
    </section>
  );
}
