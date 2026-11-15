"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { execute, WELCOME, type CommandContext, type TerminalLine } from "@/data/terminalCommands";

interface PrintedLine extends TerminalLine {
  id: number;
  input?: boolean;
}

const TONES: Record<NonNullable<TerminalLine["tone"]>, string> = {
  ok: "text-ns-cyan",
  warn: "text-ns-magenta",
  dim: "text-ns-gray",
  accent: "text-ns-yellow",
};

/** NETRUNNER — a scripted, simulated terminal. See data/terminalCommands.ts. */
export function TerminalApp({ openApp, reducedMotion }: CommandContext & { reducedMotion: boolean }) {
  const [lines, setLines] = useState<PrintedLine[]>([]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const queue = useRef<TerminalLine[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const nextId = useRef(0);
  const history = useRef<string[]>([]);
  const historyIndex = useRef(-1);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prints queued lines one at a time, so output arrives like a real stream.
  const pump = useCallback(() => {
    if (timer.current !== undefined) return;
    const step = () => {
      const line = queue.current.shift();
      if (!line) {
        timer.current = undefined;
        setBusy(false);
        return;
      }
      setLines((current) => [...current, { ...line, id: nextId.current++ }]);
      const wait = reducedMotion ? 0 : (queue.current[0]?.delay ?? 45);
      timer.current = window.setTimeout(step, wait);
    };
    setBusy(true);
    timer.current = window.setTimeout(step, 0);
  }, [reducedMotion]);

  useEffect(() => {
    queue.current.push(...WELCOME);
    pump();
    inputRef.current?.focus({ preventScroll: true });
    return () => {
      window.clearTimeout(timer.current);
      timer.current = undefined;
      queue.current = [];
    };
  }, [pump]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const input = value.trim();
    setValue("");
    if (!input) return;
    history.current.unshift(input);
    historyIndex.current = -1;

    const result = execute(input, { openApp });
    if (result === "clear") {
      queue.current = [];
      setLines([]);
      return;
    }
    setLines((current) => [...current, { id: nextId.current++, text: input, input: true }]);
    queue.current.push(...result);
    pump();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const next = historyIndex.current + (event.key === "ArrowUp" ? 1 : -1);
    historyIndex.current = Math.max(-1, Math.min(history.current.length - 1, next));
    setValue(history.current[historyIndex.current] ?? "");
  };

  return (
    <div className="flex h-full flex-col font-mono text-[0.8125rem] leading-relaxed" onClick={() => inputRef.current?.focus()}>
      <div
        ref={logRef}
        data-lenis-prevent
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain whitespace-pre-wrap break-words p-4"
      >
        {lines.map((line) => (
          <p key={line.id} className={line.input ? "text-ns-white" : line.tone ? TONES[line.tone] : "text-ns-white/85"}>
            {line.input && <span className="text-ns-cyan">guest@night-os:~$ </span>}
            {line.text || " "}
          </p>
        ))}
      </div>
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-ns-line px-4 py-3">
        <label htmlFor="netrunner-input" className="shrink-0 text-ns-cyan">
          <span className="sr-only">Command</span>
          <span aria-hidden>guest@night-os:~$</span>
        </label>
        <input
          id="netrunner-input"
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          aria-describedby="netrunner-hint"
          className="min-w-0 flex-1 bg-transparent text-ns-white caret-ns-cyan outline-none placeholder:text-ns-gray/70"
          placeholder={busy ? "…" : "help"}
        />
        <span id="netrunner-hint" className="sr-only">
          Simulated terminal. Type help and press Enter for the list of commands.
        </span>
      </form>
    </div>
  );
}
