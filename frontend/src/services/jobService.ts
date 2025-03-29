export interface CreateJobData {
  title: string;
  description: string;
  category: string;
  reward: number;
  timeEstimate: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  status: 'open' | 'in_progress' | 'pending_review' | 'completed' | 'cancelled' | 'expired';
  createdBy: string;
  assignedTo?: string;
  expiresAt: Date;
  completedAt?: Date;
  completionRequest?: {
    comment: string;
    submittedAt: Date;
  };
} 