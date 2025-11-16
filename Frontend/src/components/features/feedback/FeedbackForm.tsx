'use client';

import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { Button } from '@/components/common';
import { useToast } from '@/contexts/ToastContext';
import { feedbackService } from '@/lib/api/services';

interface FeedbackFormProps {
  projectId: string;
  onSuccess: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ projectId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }

    if (!comment.trim()) {
      showToast('Please enter a comment', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackService.createFeedback({
        projectId,
        comment: comment.trim(),
        rating
      });
      showToast('Feedback submitted successfully', 'success');
      setRating(0);
      setComment('');
      onSuccess();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to submit feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leave Feedback</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rating
        </label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Share your thoughts about this project..."
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  );
};
