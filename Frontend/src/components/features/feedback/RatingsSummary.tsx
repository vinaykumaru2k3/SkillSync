'use client';

import React from 'react';
import { RatingAggregation } from '@/types/feedback';
import { StarRating } from './StarRating';

interface RatingsSummaryProps {
  ratings: RatingAggregation;
}

export const RatingsSummary: React.FC<RatingsSummaryProps> = ({ ratings }) => {
  const getRatingPercentage = (count: number) => {
    if (ratings.totalRatings === 0) return 0;
    return (count / ratings.totalRatings) * 100;
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ratings Summary</h3>
      
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {ratings.averageRating.toFixed(1)}
          </div>
          <StarRating rating={Math.round(ratings.averageRating)} readonly size="sm" />
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {ratings.totalRatings} {ratings.totalRatings === 1 ? 'rating' : 'ratings'}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratings[`rating${star}Count` as keyof RatingAggregation] as number;
            const percentage = getRatingPercentage(count);
            
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{star}★</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
