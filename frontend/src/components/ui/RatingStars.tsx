'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  max?: number;
  readOnly?: boolean;
  onChange?: (score: number) => void;
  size?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  max = 5,
  readOnly = true,
  onChange,
  size = 16,
}) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <button
            type="button"
            key={index}
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(starValue)}
            className={`transition ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-100 text-slate-300 dark:fill-slate-800 dark:text-slate-700'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
