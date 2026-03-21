const sizeMap = {
  sm: { width: 16, height: 16, textClass: "text-xs" },
  md: { width: 20, height: 20, textClass: "text-sm" },
  lg: { width: 24, height: 24, textClass: "text-base" },
} as const;

const starPath = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

function StarIcon({
  type,
  width,
  height,
  index,
}: Readonly<{
  type: "full" | "half" | "empty";
  width: number;
  height: number;
  index: number;
}>) {
  if (type === "full") {
    return (
      <svg viewBox="0 0 24 24" width={width} height={height} xmlns="http://www.w3.org/2000/svg">
        <path d={starPath} className="fill-star stroke-star" strokeWidth={1} />
      </svg>
    );
  }

  if (type === "empty") {
    return (
      <svg viewBox="0 0 24 24" width={width} height={height} xmlns="http://www.w3.org/2000/svg">
        <path d={starPath} className="fill-star-empty stroke-star-empty" strokeWidth={1} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`half-grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="50%" style={{ stopColor: "var(--color-star)" }} />
          <stop offset="50%" style={{ stopColor: "var(--color-star-empty)" }} />
        </linearGradient>
      </defs>
      <path d={starPath} fill={`url(#half-grad-${index})`} className="stroke-star" strokeWidth={1} />
    </svg>
  );
}

export default function RatingStars({
  rating,
  showNumeric = true,
  size = "md",
  className,
}: Readonly<{
  rating: number;
  showNumeric?: boolean;
  size?: keyof typeof sizeMap;
  className?: string;
}>) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const fill = rating - i;
    if (fill >= 0.75) return "full" as const;
    if (fill >= 0.25) return "half" as const;
    return "empty" as const;
  });

  const { width, height, textClass } = sizeMap[size];

  return (
    <div
      className={`flex items-center gap-0.5 ${className ?? ""}`}
      role="img"
      aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars`}
    >
      {stars.map((type, i) => (
        <StarIcon key={i} type={type} width={width} height={height} index={i} />
      ))}
      {showNumeric && (
        <span className={`ml-1.5 font-medium text-gray-700 ${textClass}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
