"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { setActiveLogo } from "@/app/actions/admin";

const logos = [
  { file: "v10-01-red-bold-italic.jpg", label: "Red Bold Italic", desc: "Red box, white italic condensed uppercase" },
  { file: "v10-02-red-bold-2line.jpg", label: "Red Bold Two Lines", desc: "Red box, FOOD BOX / FINDER in two lines" },
  { file: "v10-05-red-slab-serif.jpg", label: "Red Slab Serif", desc: "Red box, white slab-serif uppercase" },
  { file: "v17-08-multi-larger-box.jpg", label: "Multicolor Large", desc: "Orange/teal/green box, bold white rounded text" },
];

export default function BoxShortlistPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick(file: string) {
    setSelected(file);
    startTransition(async () => {
      await setActiveLogo(file);
      window.location.href = window.location.pathname + "?t=" + Date.now();
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900">Logo Finalists</h1>
        <p className="mt-2 text-neutral-600">
          Click any logo to set it as the site logo
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {logos.map((logo) => {
          const isActive = selected === logo.file;
          return (
            <button
              key={logo.file}
              onClick={() => handleClick(logo.file)}
              disabled={isPending}
              className={`group relative rounded-xl border bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all text-left ${
                isActive
                  ? "ring-3 ring-primary-500 border-primary-400"
                  : "border-neutral-200 hover:ring-2 hover:ring-primary-300"
              } ${isPending ? "opacity-60" : ""}`}
            >
              <div className="relative aspect-[3/2]">
                <Image
                  src={`/assets/logos/box-concepts/${logo.file}`}
                  alt={logo.label}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-contain p-2"
                />
                {isActive && (
                  <span className="absolute top-1.5 right-1.5 text-[11px] font-bold text-white bg-primary-600 px-2 py-0.5 rounded">
                    Active
                  </span>
                )}
              </div>
              <div className="px-3 pb-3">
                <p className="text-sm font-bold text-neutral-900">{logo.label}</p>
                <p className="text-xs text-neutral-500">{logo.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
