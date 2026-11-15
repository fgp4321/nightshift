"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import type { OsAppId } from "@/data/terminalCommands";

export interface OsAppDefinition {
  id: OsAppId;
  title: string;
  caption: string;
  /** Desktop window size and starting offset inside the desktop area, in px. */
  width: number;
  height: number;
  left: number;
  top: number;
  icon: ReactNode;
}

/** Open windows in stacking order: the last one is on top and focused. */
export function useWindowManager() {
  const [stack, setStack] = useState<OsAppId[]>([]);
  const open = useCallback((id: OsAppId) => setStack((current) => [...current.filter((item) => item !== id), id]), []);
  const close = useCallback((id: OsAppId) => setStack((current) => current.filter((item) => item !== id)), []);
  return { stack, open, close };
}

interface OsWindowProps {
  app: OsAppDefinition;
  focused: boolean;
  zIndex: number;
  draggable: boolean;
  bounds: RefObject<HTMLDivElement | null>;
  onFocus: () => void;
  onClose: () => void;
  children: ReactNode;
}

/**
 * One application window. Motion owns its transform (open/close and drag).
 * Wide screens: free-floating and draggable by the title bar. Narrow
 * screens: a full sheet, one app at a time.
 */
function OsWindow({ app, focused, zIndex, draggable, bounds, onFocus, onClose, children }: OsWindowProps) {
  const controls = useDragControls();
  const ref = useRef<HTMLElement>(null);

  // Move focus into the window when it opens, unless the app already took it.
  useEffect(() => {
    const el = ref.current;
    if (el && !el.contains(document.activeElement)) el.focus({ preventScroll: true });
  }, []);

  return (
    <motion.section
      ref={ref}
      role="dialog"
      aria-label={app.title}
      tabIndex={-1}
      drag={draggable}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.04}
      dragConstraints={bounds}
      initial={{ opacity: 0, scale: 0.94, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.16 } }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      onPointerDownCapture={onFocus}
      onFocusCapture={onFocus}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
      style={
        draggable
          ? { zIndex, left: app.left, top: app.top, width: `min(${app.width}px, 100%)`, height: `min(${app.height}px, 100%)` }
          : { zIndex }
      }
      className={`ns-window pointer-events-auto absolute flex flex-col outline-none ${draggable ? "" : "inset-0"} ${
        focused ? "ns-window-focused" : ""
      }`}
    >
      <header
        onPointerDown={(event) => draggable && controls.start(event)}
        className={`flex h-11 shrink-0 select-none items-center justify-between gap-3 border-b border-ns-line pl-4 ${
          draggable ? "cursor-grab touch-none active:cursor-grabbing" : ""
        }`}
      >
        <h3 className="ns-label flex min-w-0 items-center gap-3 text-ns-white">
          <span className={`size-1.5 shrink-0 ${focused ? "bg-ns-cyan" : "bg-ns-gray"}`} aria-hidden />
          <span className="truncate">{app.title}</span>
          <span className="hidden truncate text-ns-gray sm:inline">{app.caption}</span>
        </h3>
        <button
          type="button"
          onClick={onClose}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label={`Close ${app.title}`}
          data-cursor="CLOSE"
          className="grid size-11 shrink-0 place-items-center text-ns-gray transition-colors hover:bg-ns-magenta hover:text-ns-black"
        >
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </motion.section>
  );
}

interface WindowLayerProps {
  apps: OsAppDefinition[];
  stack: OsAppId[];
  draggable: boolean;
  bounds: RefObject<HTMLDivElement | null>;
  onFocus: (id: OsAppId) => void;
  onClose: (id: OsAppId) => void;
  render: (id: OsAppId) => ReactNode;
}

/** Renders every open window, in stacking order. */
export function WindowLayer({ apps, stack, draggable, bounds, onFocus, onClose, render }: WindowLayerProps) {
  const top = stack[stack.length - 1];
  return (
    <AnimatePresence>
      {apps
        .filter((app) => stack.includes(app.id))
        .map((app) => (
          <OsWindow
            key={app.id}
            app={app}
            focused={app.id === top}
            zIndex={10 + stack.indexOf(app.id)}
            draggable={draggable}
            bounds={bounds}
            onFocus={() => app.id !== top && onFocus(app.id)}
            onClose={() => onClose(app.id)}
          >
            {render(app.id)}
          </OsWindow>
        ))}
    </AnimatePresence>
  );
}
