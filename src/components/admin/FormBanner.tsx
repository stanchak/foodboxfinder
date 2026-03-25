"use client";

import { useEffect, useRef } from "react";

export default function FormBanner({
  success,
  message,
}: Readonly<{
  success: boolean;
  message: string;
}>) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && bannerRef.current) {
      bannerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [message, success]);

  if (!message) return null;

  return (
    <div
      ref={bannerRef}
      role={success ? "status" : "alert"}
      className={`border rounded-lg p-3 text-sm flex items-start gap-2 ${
        success
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-red-50 border-red-200 text-red-700"
      }`}
    >
      {success ? (
        <svg className="w-5 h-5 flex-shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 flex-shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <span>{message}</span>
    </div>
  );
}
