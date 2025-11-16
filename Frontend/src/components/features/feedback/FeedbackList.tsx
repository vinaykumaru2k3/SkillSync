'use client';

import React, { useState } from 'react';
import { FeedbackResponse } from '@/types/feedback';
import { StarRating } from './StarRating';
import { Button } from '@/components/common';
import { useToast } from '@/contexts/ToastContext';
import { feedbackService } from '@/lib/api/services';
import { useAuth } from '@/contexts/AuthContext';

const ITEMS_PER_PAGE = 5;

interface FeedbackListProps {
  feedback: FeedbackResponse[];
  onUpdate: () => void;
  isOwner: boolean;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({ feedback, onUpdate, isOwner }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();
  const { user } = useAuth();

  const totalPages = Math.ceil(feedback.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFeedback = feedback.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleEdit = (item: FeedbackResponse) => {
    setEditingId(item.id);
    setEditComment(item.comment);
    setEditRating(item.rating);
  };

  const handleUpdate = async (feedbackId: string, projectId: string) => {
    if (editRating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackService.updateFeedback(feedbackId, {
        projectId,
        comment: editComment.trim(),
        rating: editRating
      });
      showToast('Feedback updated successfully', 'success');
      setEditingId(null);
      onUpdate();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to update feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = async (feedbackId: string, isAuthor: boolean) => {
    try {
      await feedbackService.deleteFeedback(feedbackId, isOwner && !isAuthor);
      showToast('Feedback deleted successfully', 'success');
      setDeleteConfirmId(null);
      onUpdate();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete feedback', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (feedback.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No feedback yet. Be the first to leave a review!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paginatedFeedback.map((item) => (
        <div
          key={item.id}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {item.authorProfileImageUrl ? (
                <img
                  src={item.authorProfileImageUrl}
                  alt={item.authorDisplayName || item.authorUsername}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {(item.authorDisplayName || item.authorUsername || 'U')[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {item.authorDisplayName || item.authorUsername || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(item.createdAt)}
                  {item.edited && ' (edited)'}
                </p>
              </div>
            </div>
            {(item.authorId === user?.userId || isOwner) && (
              <div className="flex gap-2">
                {editingId !== item.id && (
                  <>
                    {item.canEdit && item.authorId === user?.userId && (
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(item)}>
                        Edit
                      </Button>
                    )}
                    {deleteConfirmId === item.id ? (
                      <div className="flex gap-2">
                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id, item.authorId === user?.userId)}>
                          Confirm
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setDeleteConfirmId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button variant="danger" size="sm" onClick={() => setDeleteConfirmId(item.id)}>
                        Delete
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {editingId === item.id ? (
            <div className="space-y-3">
              <StarRating rating={editRating} onRatingChange={setEditRating} />
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleUpdate(item.id, item.projectId)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingId(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <StarRating rating={item.rating} readonly size="sm" />
              <p className="mt-2 text-gray-700 dark:text-gray-300">{item.comment}</p>
            </>
          )}
        </div>
      ))}
      
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
