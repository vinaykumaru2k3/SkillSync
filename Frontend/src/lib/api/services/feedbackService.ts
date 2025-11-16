import { apiClient } from '../client';
import { FeedbackRequest, FeedbackResponse, RatingAggregation } from '@/types/feedback';

export const feedbackService = {
  createFeedback: async (request: FeedbackRequest): Promise<FeedbackResponse> => {
    return await apiClient.post('/feedback', request);
  },

  updateFeedback: async (feedbackId: string, request: FeedbackRequest): Promise<FeedbackResponse> => {
    return await apiClient.put(`/feedback/${feedbackId}`, request);
  },

  deleteFeedback: async (feedbackId: string, isOwner: boolean = false): Promise<void> => {
    await apiClient.delete(`/feedback/${feedbackId}?isOwner=${isOwner}`);
  },

  getProjectFeedback: async (projectId: string): Promise<FeedbackResponse[]> => {
    return await apiClient.get(`/feedback/project/${projectId}`);
  },

  getProjectRatings: async (projectId: string): Promise<RatingAggregation> => {
    return await apiClient.get(`/feedback/project/${projectId}/ratings`);
  }
};
