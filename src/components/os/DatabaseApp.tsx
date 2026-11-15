"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CATEGORIES, DATABASE, type DatabaseCategory } from "@/data/database";

/** DATABASE — the city's fictional archive. Records open and close in place. */
export function DatabaseApp() {
  const [category, setCategory] = useState<DatabaseCategory>("characters");
  const [openId, setOpenId] = useState<string | null>(null);
  const records = DATABASE.filter((record) => record.category === category);
  const record = DATABASE.find((item) => item.id === openId) ?? null;

  return (
    <div className="flex h-full flex-col">
      <div role="tablist" aria-label="Archive sections" className="flex shrink-0 gap-1 overflow-x-auto border-b border-ns-line px-3 py-2" data-lenis-prevent>
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === category}
            onClick={() => {
              setCategory(item.id);
              setOpenId(null);
            }}
            className="ns-label h-9 shrink-0 px-3 text-ns-gray transition-colors hover:text-ns-white aria-selected:bg-ns-cyan aria-selected:text-ns-black"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="relative min-h-0 flex-1">
        <ul data-lenis-prevent className="h-full overflow-y-auto overscroll-contain p-3" aria-label={`${category} records`}>
          {records.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setOpenId(item.id)}
                data-cursor="OPEN"
                className="group flex w-full items-baseline justify-between gap-4 border-b border-ns-line px-2 py-3 text-left transition-colors hover:bg-ns-cyan/10"
              >
                <span>
                  <span className="block font-medium text-ns-white group-hover:text-ns-cyan">{item.title}</span>
                  <span className="ns-label text-ns-gray">{item.subtitle}</span>
                </span>
                <span className="ns-label shrink-0 text-ns-gray" aria-hidden>
                  {item.classified ? "■ sealed" : item.id.toUpperCase()}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <AnimatePresence>
          {record && (
            <motion.article
              key={record.id}
              data-lenis-prevent
              aria-label={record.title}
              className="absolute inset-0 overflow-y-auto overscroll-contain bg-ns-dark p-5"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                autoFocus
                onClick={() => setOpenId(null)}
                data-cursor="CLOSE"
                className="ns-label mb-5 inline-flex h-9 items-center gap-2 border border-ns-line px-3 text-ns-white transition-colors hover:border-ns-cyan hover:text-ns-cyan"
              >
                <span aria-hidden>←</span> Close record
              </button>
              {record.classified && (
                <p className="ns-label mb-4 border border-ns-magenta px-3 py-2 text-ns-magenta">
                  Classified — partially redacted
                </p>
              )}
              <h3 className="ns-monument text-4xl text-ns-white">{record.title}</h3>
              <p className="ns-label mt-2 text-ns-cyan">{record.subtitle}</p>
              <dl className="ns-label mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border-y border-ns-line py-4">
                {record.meta.map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-ns-gray">{label}</dt>
                    <dd className="text-ns-white">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 max-w-prose space-y-3 text-[0.9375rem] leading-relaxed text-ns-white/85">
                {record.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
