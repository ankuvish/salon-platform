"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ value, onChange, readonly = false, size = "lg" }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (rating: number) => {
    if (!readonly) {
      const clampedRating = Math.min(5, Math.max(0.5, rating));
      onChange(clampedRating);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (readonly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const fraction = x / width;
    const rating = Math.min(5, starIndex - 1 + fraction);
    const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
    setHoverRating(Math.max(0.5, roundedRating));
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const displayRating = Math.min(5, hoverRating || value);
  const starSize = size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6";
  const textSize = size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base";

  // Luxurious gradient: Rose Gold (low) → Gold (mid) → Emerald (high)
  const getStarColor = (rating: number) => {
    if (rating <= 2) {
      // Rose Gold to Coral (1-2 stars)
      const t = rating / 2;
      return `rgb(${Math.round(229 + (26 * t))}, ${Math.round(152 - (52 * t))}, ${Math.round(155 - (55 * t))}`;
    } else if (rating <= 3.5) {
      // Coral to Gold (2-3.5 stars)
      const t = (rating - 2) / 1.5;
      return `rgb(${Math.round(255 - (5 * t))}, ${Math.round(200 - (15 * t))}, ${Math.round(100 - (80 * t))}`;
    } else {
      // Gold to Emerald (3.5-5 stars)
      const t = (rating - 3.5) / 1.5;
      return `rgb(${Math.round(250 - (170 * t))}, ${Math.round(185 + (30 * t))}, ${Math.round(20 + (100 * t))}`;
    }
  };

  const starColor = getStarColor(displayRating);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFull = displayRating >= starIndex;
        const isHalf = displayRating >= starIndex - 0.5 && displayRating < starIndex;

        return (
          <div
            key={starIndex}
            className={`relative ${readonly ? "" : "cursor-pointer"}`}
            onMouseMove={(e) => handleMouseMove(e, starIndex)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starIndex)}
          >
            <Star
              className={`${starSize} transition-all duration-200`}
              style={{
                fill: isFull ? starColor : isHalf ? `${starColor}80` : 'rgb(209, 213, 219)',
                color: isFull || isHalf ? starColor : 'rgb(209, 213, 219)',
                filter: isFull || isHalf ? 'drop-shadow(0 0 3px rgba(0,0,0,0.2))' : 'none'
              }}
            />
          </div>
        );
      })}
      <span className={`ml-2 font-semibold ${textSize}`}>{displayRating.toFixed(1)}</span>
    </div>
  );
}
