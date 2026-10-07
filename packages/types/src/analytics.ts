export interface AnalyticsOverview {
  totalFeedbacks: number;
  totalVotes: number;
  totalComments: number;
  resolvedRatio: number;
  statusBreakdown: {
    open: number;
    underReview: number;
    planned: number;
    inProgress: number;
    completed: number;
    closed: number;
  };
  weeklyActivity: {
    day: string;
    feedbacks: number;
    votes: number;
  }[];
  topRequestedFeatures: {
    id: string;
    title: string;
    voteCount: number;
    status: string;
  }[];
}
