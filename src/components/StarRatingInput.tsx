"use client";

import { useState, useCallback } from "react";

const starPath =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"] as const;

export default function StarRatingInput({
  name,
  value,
  onChange,
  error,
}: Readonly<{
  name: string;
  value: number;
  onChange: (rating: number) => void;
  error?: string;
}>) {
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleStarClick = useCallback(
    (rating: number) => {
      onChange(rating);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, rating: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onChange(rating);
      }
    },
    [onChange],
  );

  const displayValue = hoveredStar || value;

  return (
    <fieldset className="space-y-1.5">
      <legend className="block text-sm font-medium text-neutral-700">
        Rating <span className="text-red-500">*</span>
      </legend>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayValue;
          return (
            <button
              key={star}
              type="button"
              className="rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onKeyDown={(e) => handleKeyDown(e, star)}
              aria-label={`Rate ${star} out of 5 - ${ratingLabels[star - 1]}`}
            >
              <svg
                viewBox="0 0 24 24"
                width={28}
                height={28}
                xmlns="http://www.w3.org/2000/svg"
                className="transition-colors"
              >
                <path
                  d={starPath}
                  className={
                    isFilled
                      ? "fill-star stroke-star"
                      : "fill-star-empty stroke-star-empty"
                  }
                  strokeWidth={1}
                />
              </svg>
            </button>
          );
        })}
        {displayValue > 0 && (
          <span className="ml-2 text-sm font-medium text-neutral-600">
            {ratingLabels[displayValue - 1]}
          </span>
        )}
      </div>
      {/* Hidden input for form data */}
      <input type="hidden" name={name} value={value} />
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
