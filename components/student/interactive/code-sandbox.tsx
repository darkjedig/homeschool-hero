"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, RotateCcw, Terminal, Code2, CheckCircle2, Target } from "lucide-react";

type Pair = { key: string; value: string };
type LogLine = { type: "log" | "info" | "warn" | "error"; text: string };

/**
 * Runnable code lab. The student edits the code and clicks Run; the code
 * executes inside a sandboxed iframe (sandbox="allow-scripts" only — no
 * same-origin, so it is fully isolated from the app and Convex). console.log
 * output is forwarded to the parent via postMessage. A `<canvas>` (id "canvas",
 * with `ctx`) is provided for game-dev drawing lessons.
 */
export function CodeSandboxBlock({ data }: { data: Pair[] }) {
  const get = (k: string) => data.find((d) => d.key === k)?.value ?? "";
  const language = (get("language") || "javascript") as "javascript" | "html";
  const starter = get("starter");
  const instructions = get("instructions");
  const challenge = get("challenge");
  const expected = get("expected");

  const [code, setCode] = useState(starter);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [ran, setRan] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const showPreview = useMemo(
    () => language === "html" || /\b(canvas|ctx|document)\b/.test(code),
    [language, code],
  );

  // Listen for console messages forwarded from the sandboxed iframe.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return;
      const d = e.data;
      if (d && d.__hsh === true) {
        setLogs((prev) => [...prev, { type: d.logType, text: d.text }]);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const srcdoc = useMemo(() => buildSrcdoc(language, code), [language, code, runKey]);

  const run = () => {
    setLogs([]);
    setRan(true);
    setRunKey((k) => k + 1); // force iframe reload even if code unchanged
  };

  const reset = () => {
    setCode(starter);
    setLogs([]);
    setRan(false);
  };

  const consoleText = logs.map((l) => l.text).join("\n");
  const passed = expected
    ? ran && consoleText.toLowerCase().includes(expected.toLowerCase())
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.05]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-black/30 px-4 py-2.5">
        <Code2 size={16} className="text-cyan-300" />
        <span className="text-sm font-semibold text-white">Code Lab</span>
        <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
          {language}
        </span>
      </div>

      <div className="space-y-3 p-4">
        {instructions && (
          <p className="text-sm leading-relaxed text-slate-200">{instructions}</p>
        )}
        {challenge && (
          <div className="flex items-start gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/[0.07] p-3 text-sm text-cyan-100">
            <Target size={15} className="mt-0.5 shrink-0 text-cyan-300" />
            <span>{challenge}</span>
          </div>
        )}

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          rows={Math.min(16, Math.max(6, code.split("\n").length + 1))}
          className="w-full resize-y rounded-xl border border-white/10 bg-black/50 p-3 font-mono text-[13px] leading-relaxed text-cyan-50 outline-none focus:border-cyan-400/50"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={run}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_0_18px_rgba(6,182,212,0.35)] hover:bg-cyan-400"
          >
            <Play size={15} /> Run
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <RotateCcw size={14} /> Reset
          </button>
          {passed === true && (
            <span className="ml-auto flex items-center gap-1 text-sm font-semibold text-green-400">
              <CheckCircle2 size={15} /> Challenge complete!
            </span>
          )}
          {passed === false && ran && (
            <span className="ml-auto text-sm font-semibold text-orange-400">
              Not yet — check the challenge.
            </span>
          )}
        </div>

        {/* Visual preview (canvas / HTML). Kept mounted so canvas drawing works;
            collapsed to zero height when the code has no visual output. */}
        <div className={showPreview ? "rounded-xl border border-white/10 bg-white" : "h-0 overflow-hidden"}>
          <iframe
            key={runKey}
            ref={iframeRef}
            title="Code preview"
            sandbox="allow-scripts"
            srcDoc={srcdoc}
            width={340}
            height={260}
            className={showPreview ? "block w-full" : ""}
            style={showPreview ? { height: 260 } : { height: 0, width: 0, border: 0 }}
          />
        </div>

        {/* Console output */}
        <div className="rounded-xl border border-white/10 bg-black/60">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            <Terminal size={13} /> Console
          </div>
          <div className="max-h-48 overflow-y-auto p-3 font-mono text-[13px] leading-relaxed">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">
                {ran ? "(no output)" : "Press Run to see the output."}
              </p>
            ) : (
              logs.map((l, i) => (
                <p
                  key={i}
                  className={
                    l.type === "error"
                      ? "text-red-400"
                      : l.type === "warn"
                        ? "text-yellow-300"
                        : "text-green-300"
                  }
                >
                  {l.text}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Build the sandboxed document: console shim + a drawing canvas + user code. */
function buildSrcdoc(language: "javascript" | "html", userCode: string): string {
  const shim = `
    <script>
      (function () {
        function fmt(a) {
          try {
            return typeof a === "object" && a !== null ? JSON.stringify(a) : String(a);
          } catch (e) { return String(a); }
        }
        function send(logType, args) {
          parent.postMessage({ __hsh: true, logType: logType, text: [].map.call(args, fmt).join(" ") }, "*");
        }
        ["log", "info", "warn", "error"].forEach(function (m) {
          var orig = console[m] ? console[m].bind(console) : function () {};
          console[m] = function () { send(m === "info" ? "log" : m, arguments); orig.apply(console, arguments); };
        });
        window.onerror = function (msg) { send("error", [msg]); return true; };
      })();
    <\/script>`;

  if (language === "html") {
    return `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;margin:8px;color:#0f172a}</style>${shim}</head><body>${userCode}</body></html>`;
  }

  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#0b1020}canvas{display:block;margin:0 auto;background:#0f172a}</style>${shim}</head><body>
    <canvas id="canvas" width="320" height="240"></canvas>
    <script>
      var canvas = document.getElementById("canvas");
      var ctx = canvas.getContext("2d");
      try {
${userCode}
      } catch (e) { console.error(e.message); }
    <\/script>
  </body></html>`;
}
