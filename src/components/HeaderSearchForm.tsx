"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function HeaderSearchForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = inputRef.current?.value.trim();
    if (value) {
      router.push(`/search?q=${encodeURIComponent(value)}`);
      inputRef.current?.blur();
    }
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="relative">
      <label htmlFor="header-search" className="sr-only">
        Search
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
        id="header-search"
        type="search"
        placeholder="Search..."
        className="w-44 rounded-full border border-neutral-200 bg-neutral-50 py-1.5 pl-9 pr-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:w-64 transition-all duration-300"
      />
    </form>
  );
}
