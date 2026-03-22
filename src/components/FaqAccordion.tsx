"use client";

import { useState, useCallback } from "react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqAccordion({
  items,
}: Readonly<{
  items: FaqItem[];
}>) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const panelId = `faq-panel-${item.id}`;
        const headingId = `faq-heading-${item.id}`;

        return (
          <div key={item.id}>
            <h4>
              <button
                id={headingId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-gray-900 hover:text-primary-700 transition-colors"
              >
                <span className="font-medium">{item.question}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={`shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </h4>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              className={isOpen ? "pb-4" : ""}
              hidden={!isOpen}
            >
              <p className="text-sm text-gray-700 leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
