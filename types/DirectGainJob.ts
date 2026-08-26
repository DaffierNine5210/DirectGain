export type DirectGainJobType =
  | 'full-time'
  | 'part-time'
  | 'casual'
  | 'contract'
  | 'one-off';

export type DirectGainJobStatus =
  | 'draft'
  | 'open'
  | 'filled'
  | 'completed'
  | 'cancelled';

export type DirectGainJobPayType =
  | 'hourly'
  | 'daily'
  | 'fixed'
  | 'salary'
  | 'negotiable';

export type DirectGainJob = {
  id: string;

  // Ownership
  posterId: string;

  // Job information
  title: string;
  description: string;
  category: string;

  jobType: DirectGainJobType;
  status: DirectGainJobStatus;

  // Pay
  payType: DirectGainJobPayType;
  payAmount?: number;
  payMin?: number;
  payMax?: number;

  // Location
  suburb: string;
  state: string;

  // Requirements
  skills: string[];
  licences: string[];

  // Engagement
  applicantCount: number;
  viewCount: number;
  saveCount: number;

  // Current user's interaction
  isSaved: boolean;

  // Timing
  createdAt: string;
  updatedAt: string;

  startsAt?: string;
};