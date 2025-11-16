'use client';

import React, { useEffect, useState } from 'react';
import { FeedbackResponse, RatingAggregation } from '@/types/feedback';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackList } from './FeedbackList';
import { RatingsSummary } from './RatingsSummary';
import { feedbackService } from '@/lib/api/services';
import { useToast } from '@/contexts/ToastContext';

interface ProjectFeedbackProps {
  projectId: string;
  isOwner: boolean;
}

export const ProjectFeedback: React.FC<ProjectFeedbackProps> = ({ projectId, isOwner }) => {
  const [feedback, setFeedback] = useState<FeedbackResponse[]>([]);
  const [ratings, setRatings] = useState<RatingAggregation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadFeedback = async () => {
    try {
      const [feedbackData, ratingsData] = await Promise.all([
        feedbackService.getProjectFeedback(projectId),
        feedbackService.getProjectRatings(projectId)
      ]);
      setFeedback(feedbackData);
      setRatings(ratingsData);
    } catch (error) {
      showToast('Failed to load feedback', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [projectId]);

  if (isLoading) {
    return <div className="text-center py-8">Loading feedback...</div>;
  }

  return (
    <div className="space-y-6">
      {ratings && ratings.totalRatings > 0 && <RatingsSummary ratings={ratings} />}
      
      {!isOwner && <FeedbackForm projectId={projectId} onSuccess={loadFeedback} />}
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Reviews ({feedback?.length || 0})
        </h3>
        <FeedbackList feedback={feedback || []} onUpdate={loadFeedback} isOwner={isOwner} />
      </div>
    </div>
  );
};
