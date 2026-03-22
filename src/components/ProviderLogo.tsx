import Image from "next/image";

const sizes = {
  sm: { container: "w-12 h-12", image: 48, text: "text-base", padding: "p-1" },
  md: { container: "w-20 h-20", image: 80, text: "text-2xl", padding: "p-1.5" },
  lg: { container: "w-56 h-56", image: 224, text: "text-5xl", padding: "p-4" },
} as const;

export default function ProviderLogo({
  logoUrl,
  name,
  size = "md",
  className,
  priority,
}: Readonly<{
  logoUrl: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}>) {
  const s = sizes[size];

  return (
    <div
      role="img"
      aria-label={`${name} logo`}
      className={`${s.container} rounded-2xl bg-white shadow-xs flex items-center justify-center overflow-hidden ${className ?? ""}`}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt=""
          width={s.image}
          height={s.image}
          className={`object-contain ${s.padding}`}
          priority={priority}
        />
      ) : (
        <span className={`font-extrabold text-neutral-300 ${s.text}`} aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
