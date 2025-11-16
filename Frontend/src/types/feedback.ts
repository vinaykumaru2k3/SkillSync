export enum ModerationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  FLAGGED = 'FLAGGED',
  REJECTED = 'REJECTED'
}

export interface FeedbackRequest {
  projectId: string;
  comment: string;
  rating: number;
}

export interface FeedbackResponse {
  id: string;
  projectId: string;
  authorId: string;
  authorUsername?: string;
  authorDisplayName?: string;
  authorProfileImageUrl?: string;
  comment: string;
  rating: number;
  moderationStatus: ModerationStatus;
  createdAt: string;
  updatedAt?: string;
  edited: boolean;
  canEdit: boolean;
}

export interface RatingAggregation {
  projectId: string;
  averageRating: number;
  totalRatings: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
}
