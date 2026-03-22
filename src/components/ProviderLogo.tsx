import Image from "next/image";

const sizes = {
  sm: { container: "w-10 h-10", image: 40, text: "text-sm", padding: "p-1" },
  md: { container: "w-16 h-16", image: 64, text: "text-xl", padding: "p-1" },
  lg: { container: "w-48 h-48", image: 192, text: "text-4xl", padding: "p-4" },
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
        <span className={`font-extrabold text-gray-300 ${s.text}`} aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
