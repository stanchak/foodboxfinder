"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useRef, useEffect, useCallback } from "react";

export default function SearchInput({
  autoFocus = false,
  placeholder = "Search providers, blog posts, collections...",
  className,
}: Readonly<{
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuery = searchParams.get("q") ?? "";

  const updateSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
          params.set("q", value.trim());
        } else {
          params.delete("q");
        }
        router.replace(`/search?${params.toString()}`);
      }, 300);
    },
    [router, searchParams],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className ?? ""}`}>
      <label htmlFor="search-input" className="sr-only">
        Search
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
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
          className="text-neutral-400"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <input
        ref={inputRef}
        id="search-input"
        type="search"
        defaultValue={currentQuery}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => updateSearch(e.target.value)}
        className="block w-full rounded-xl border border-neutral-200 bg-white py-3.5 pl-12 pr-4 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors shadow-sm"
      />
    </div>
  );
}
