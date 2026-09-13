"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CosmoAvatar } from "@/components/shared/cosmo-avatar";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { TEACHER_NAME } from "@/lib/teacher-name";
import { defaultSuggestions } from "@/lib/teacher-context";
import {
  isVoiceCancelled,
  micErrorMessage,
  startVoiceTurn,
  type VoiceTurn,
} from "@/lib/audio-recorder";
import { useTeacherContext } from "./teacher-context";
import { TeacherPanel, type ChatTurn } from "./teacher-panel";

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return mobile;
}

function playMp3(
  base64: string,
  current: { stop: () => void } | null,
  onEnd: () => void,
): { stop: () => void } {
  current?.stop();
  const audio = new Audio(`data:audio/mpeg;base64,${base64}`);
  let ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;
    audio.onended = null;
    audio.onerror = null;
    onEnd();
  };
  audio.onended = finish;
  audio.onerror = finish;
  void audio.play().catch(() => finish());
  return {
    stop: () => {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.src = "";
      finish();
    },
  };
}

export function TeacherAssistant() {
  const ui = useQuery(api.settings.getTeacherUiConfig);
  const profile = useQuery(api.userProfiles.getMine);
  const chat = useAction(api.teacher.chat);
  const transcribe = useAction(api.teacher.transcribe);
  const { context, open, setOpen } = useTeacherContext();
  const mobile = useIsMobile();
  const reducedMotion = profile?.reducedMotion ?? false;

  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<VoiceTurn | null>(null);
  const audioRef = useRef<{ stop: () => void } | null>(null);
  const idRef = useRef(0);
  const cycleIdRef = useRef(0);
  const voiceModeRef = useRef(false);
  const busyRef = useRef(false);
  const listeningRef = useRef(false);
  const speakingRef = useRef(false);
  const mutedRef = useRef(false);
  const sendingRef = useRef(false);
  const openRef = useRef(open);
  const messagesRef = useRef(messages);
  const contextRef = useRef(context);
  const spokenRef = useRef(!!ui?.spokenRepliesEnabled);
  const listenAgainRef = useRef<() => void>(() => {});
  const listenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chips = suggestions.length > 0 ? suggestions : defaultSuggestions(context.page);

  useEffect(() => {
    openRef.current = open;
    messagesRef.current = messages;
    contextRef.current = context;
    spokenRef.current = !!ui?.spokenRepliesEnabled;
  }, [open, messages, context, ui?.spokenRepliesEnabled]);

  const stopListening = useCallback(() => {
    cycleIdRef.current += 1;
    if (listenTimerRef.current) {
      clearTimeout(listenTimerRef.current);
      listenTimerRef.current = null;
    }
    recorderRef.current?.cancel();
    recorderRef.current = null;
    listeningRef.current = false;
    setListening(false);
  }, []);

  const close = useCallback(() => {
    stopListening();
    audioRef.current?.stop();
    speakingRef.current = false;
    setSpeaking(false);
    voiceModeRef.current = false;
    setVoiceMode(false);
    setOpen(false);
  }, [setOpen, stopListening]);

  useEffect(() => {
    return () => {
      if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
      audioRef.current?.stop();
      recorderRef.current?.cancel();
    };
  }, []);

  const sendText = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || sendingRef.current) return;
      sendingRef.current = true;
      busyRef.current = true;
      setBusy(true);
      setError(null);
      const userTurn: ChatTurn = { id: `u-${++idRef.current}`, role: "user", content: text };
      const history = messagesRef.current.slice(-8);
      setMessages((prev) => [...prev, userTurn]);
      setInput("");
      try {
        const shouldSpeak = spokenRef.current && !mutedRef.current;
        const result = await chat({
          message: text,
          history: history.map((m) => ({ role: m.role, content: m.content })),
          appContext: JSON.parse(JSON.stringify(contextRef.current)) as typeof context,
          speak: shouldSpeak,
          now: Date.now(),
        });
        setMessages((prev) => [
          ...prev,
          { id: `a-${++idRef.current}`, role: "assistant", content: result.message },
        ]);
        setSuggestions(result.suggestions);
        if (result.audioBase64 && shouldSpeak) {
          speakingRef.current = true;
          setSpeaking(true);
          audioRef.current = playMp3(result.audioBase64, audioRef.current, () => {
            speakingRef.current = false;
            setSpeaking(false);
            listenAgainRef.current();
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Teacher is taking a break. Try again.");
      } finally {
        sendingRef.current = false;
        busyRef.current = false;
        setBusy(false);
        if (!speakingRef.current) listenAgainRef.current();
      }
    },
    [chat],
  );

  const runVoiceCycle = useCallback(async () => {
    if (!voiceModeRef.current || !openRef.current || busyRef.current || speakingRef.current) {
      return;
    }
    const cycle = ++cycleIdRef.current;
    let started = false;
    try {
      const turn = await startVoiceTurn();
      started = true;
      if (cycle !== cycleIdRef.current || !voiceModeRef.current || !openRef.current) {
        turn.cancel();
        return;
      }
      recorderRef.current = turn;
      listeningRef.current = true;
      setListening(true);
      const clip = await turn.result;
      if (cycle !== cycleIdRef.current) return;
      recorderRef.current = null;
      listeningRef.current = false;
      setListening(false);
      if (!voiceModeRef.current || !openRef.current) return;
      if (clip.base64.length < 80) {
        listenAgainRef.current();
        return;
      }
      busyRef.current = true;
      setBusy(true);
      const result = await transcribe({
        audioBase64: clip.base64,
        format: clip.format,
      });
      if (cycle !== cycleIdRef.current) {
        if (!sendingRef.current) {
          busyRef.current = false;
          setBusy(false);
        }
        return;
      }
      if (result.error) {
        setError(result.error);
        busyRef.current = false;
        setBusy(false);
        listenAgainRef.current();
        return;
      }
      if (!result.text) {
        busyRef.current = false;
        setBusy(false);
        listenAgainRef.current();
        return;
      }
      await sendText(result.text);
    } catch (err) {
      if (cycle !== cycleIdRef.current) return;
      recorderRef.current = null;
      listeningRef.current = false;
      setListening(false);
      if (sendingRef.current) return;
      busyRef.current = false;
      setBusy(false);
      if (isVoiceCancelled(err)) return;
      const message = micErrorMessage(err);
      if (message) setError(message);
      if (!started) {
        voiceModeRef.current = false;
        setVoiceMode(false);
      } else {
        listenAgainRef.current();
      }
    }
  }, [sendText, transcribe]);

  useEffect(() => {
    listenAgainRef.current = () => {
      if (listenTimerRef.current) clearTimeout(listenTimerRef.current);
      listenTimerRef.current = setTimeout(() => {
        listenTimerRef.current = null;
        if (
          !voiceModeRef.current ||
          !openRef.current ||
          busyRef.current ||
          sendingRef.current ||
          speakingRef.current ||
          listeningRef.current
        ) {
          return;
        }
        void runVoiceCycle();
      }, 350);
    };
  }, [runVoiceCycle]);

  const onToggleVoiceMode = useCallback(() => {
    if (busyRef.current && !voiceModeRef.current) return;
    const next = !voiceModeRef.current;
    voiceModeRef.current = next;
    setVoiceMode(next);
    setError(null);
    if (next) {
      mutedRef.current = false;
      setMuted(false);
      listenAgainRef.current();
      return;
    }
    stopListening();
    if (!sendingRef.current) {
      busyRef.current = false;
      setBusy(false);
    }
  }, [stopListening]);

  if (!ui?.enabled) return null;

  const panel = (
    <TeacherPanel
      open={open}
      onClose={close}
      mobile={mobile}
      messages={messages}
      suggestions={open ? chips : []}
      input={input}
      onInput={setInput}
      onSend={() => {
        if (listeningRef.current) stopListening();
        void sendText(input);
      }}
      onSuggestion={(text) => void sendText(text)}
      onNewConversation={() => {
        audioRef.current?.stop();
        speakingRef.current = false;
        setSpeaking(false);
        setMessages([]);
        setSuggestions([]);
        setError(null);
        setInput("");
      }}
      busy={busy}
      listening={listening}
      voiceMode={voiceMode}
      voiceEnabled={ui.voiceInputEnabled}
      spokenEnabled={ui.spokenRepliesEnabled}
      muted={muted}
      speaking={speaking}
      onToggleMute={() => {
        setMuted((value) => {
          const next = !value;
          mutedRef.current = next;
          if (next) {
            audioRef.current?.stop();
            speakingRef.current = false;
            setSpeaking(false);
            listenAgainRef.current();
          }
          return next;
        });
      }}
      onToggleVoiceMode={() => onToggleVoiceMode()}
      error={error}
      reducedMotion={reducedMotion}
      context={context}
    />
  );

  return (
    <>
      <button
        type="button"
        aria-label={`Open ${TEACHER_NAME}`}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-50 h-14 w-14 overflow-hidden rounded-full border border-cyan-300/40 bg-[#071525] shadow-[0_0_24px_rgba(34,211,238,0.45)] transition hover:scale-105 md:bottom-6 md:right-24"
      >
        <CosmoAvatar className="h-full w-full" />
      </button>

      {mobile ? (
        <Drawer open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
          <DrawerContent className="z-[60] h-[92vh] border-white/10 bg-[#08111f] p-0">
            <DrawerTitle className="sr-only">{TEACHER_NAME}</DrawerTitle>
            {panel}
          </DrawerContent>
        </Drawer>
      ) : (
        open && (
          <div className="fixed inset-y-0 right-0 z-[60] w-[min(28rem,100vw)]">
            {panel}
          </div>
        )
      )}
    </>
  );
}
