export type JobStatus =
  | 'open'
  | 'assigned'
  | 'completed'
  | 'cancelled';

export type JobCategory =
  | 'trades'
  | 'labour'
  | 'landscaping'
  | 'cleaning'
  | 'hospitality'
  | 'admin'
  | 'delivery'
  | 'automotive'
  | 'care'
  | 'other';

export type JobType =
  | 'one_off'
  | 'casual'
  | 'part_time'
  | 'full_time'
  | 'contract';

export type JobPayType =
  | 'hourly'
  | 'daily'
  | 'fixed'
  | 'salary'
  | 'negotiable';

export type JobWorkSite =
  | 'on_site'
  | 'remote'
  | 'hybrid';

export type JobAccountType =
  | 'personal'
  | 'business';

export const JOB_CATEGORIES: JobCategory[] =
  [
    'trades',
    'labour',
    'landscaping',
    'cleaning',
    'hospitality',
    'admin',
    'delivery',
    'automotive',
    'care',
    'other',
  ];

export const JOB_PAY_TYPES: JobPayType[] =
  [
    'hourly',
    'daily',
    'fixed',
    'salary',
    'negotiable',
  ];

export const JOB_TYPES: JobType[] = [
  'one_off',
  'casual',
  'part_time',
  'full_time',
  'contract',
];

export const JOB_WORK_SITES: JobWorkSite[] =
  [
    'on_site',
    'remote',
    'hybrid',
  ];

export type CreateOpenJobInput = {
  title: string;
  description: string;
  category: JobCategory;
  jobType: JobType;
  payType: JobPayType;
  payAmount?: number | null;
  suburb: string;
  state: string;
  workSite?: JobWorkSite | null;
};

export type JobPosterRow = {
  id: string;
  display_name: string;
  avatar_path: string | null;
  account_type: JobAccountType;
};

export type JobRow = {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  job_type: JobType;
  status: JobStatus;
  pay_type: JobPayType;
  pay_amount: number | string | null;
  pay_min: number | string | null;
  pay_max: number | string | null;
  suburb: string;
  state: string;
  work_site: JobWorkSite | null;
  starts_on: string | null;
  published_at: string;
  created_at: string;
  poster_id: string;
  poster?: JobPosterRow | JobPosterRow[] | null;
};

export type JobPosterPreview = {
  id: string;
  displayName: string;
  avatarPath: string | null;
  accountType: JobAccountType;
};

export type Job = {
  id: string;
  title: string;
  description: string;
  descriptionPreview: string;
  category: JobCategory;
  categoryLabel: string;
  jobType: JobType;
  jobTypeLabel: string;
  status: JobStatus;
  payType: JobPayType;
  payLabel: string;
  suburb: string;
  state: string;
  locationLabel: string;
  workSite: JobWorkSite | null;
  workSiteLabel: string | null;
  startsOn: string | null;
  publishedAt: string;
  postedLabel: string;
  posterId: string;
  poster: JobPosterPreview | null;
};

export type ViewerJobRegion = {
  suburb: string | null;
  state: string | null;
};

export type ListOpenJobsInput = {
  offset: number;
  limit: number;
  search?: string;
  region?: ViewerJobRegion | null;
  category?: JobCategory | null;
  payType?: JobPayType | null;
  jobType?: JobType | null;
};

export const JOB_PAGE_SIZE = 20;

export const MAX_JOB_PHOTOS = 5;

export const JOB_MEDIA_MAX_BYTES = 2 * 1024 * 1024;

export const JOB_MEDIA_TARGET_BYTES = Math.floor(
  1.7 * 1024 * 1024,
);

export type PendingJobPhoto = {
  localId: string;
  uri: string;
  byteSize: number;
};

export type JobMediaInsert = {
  job_id: string;
  uploader_id: string;
  storage_path: string;
  position: number;
  media_type: 'photo';
  mime_type: 'image/jpeg';
  byte_size: number;
};

export type JobPhotoAttachResult =
  | {
      status: 'skipped';
    }
  | {
      status: 'full_success';
      uploaded: number;
    }
  | {
      status: 'partial_failure';
      uploaded: number;
      failed: number;
      message: string;
    }
  | {
      status: 'complete_failure';
      failed: number;
      message: string;
    };

export type JobMediaRecord = {
  id: string;
  jobId: string;
  storagePath: string;
  position: number;
  mediaType: 'photo';
  mimeType: string;
  byteSize: number;
  createdAt: string;
};

export type ResolvedJobPhoto = {
  id: string;
  position: number;
  signedUrl: string;
};

export type JobCoverPresentation = {
  url: string;
  photoCount: number;
};

export type JobApplicationStatus =
  | 'submitted'
  | 'withdrawn'
  | 'declined'
  | 'selected'
  | 'not_selected'
  | 'cancelled';

export const JOB_APPLICATION_STATUSES: JobApplicationStatus[] =
  [
    'submitted',
    'withdrawn',
    'declined',
    'selected',
    'not_selected',
    'cancelled',
  ];

export const JOB_APPLICATION_MESSAGE_MAX =
  500;

export const JOB_APPLICATION_MESSAGE_MIN =
  10;

export type JobApplication = {
  id: string;
  jobId: string;
  applicantId: string;
  status: JobApplicationStatus;
  createdAt: string;
};

export type JobApplicantProfile = {
  displayName: string;
  bio: string | null;
  suburb: string | null;
  state: string | null;
  accountType: JobAccountType;
  avatarPath: string | null;
};

export type PosterJobApplication = {
  id: string;
  jobId: string;
  status: JobApplicationStatus;
  message: string | null;
  createdAt: string;
  applicantProfileId: string;
  applicant: JobApplicantProfile | null;
};

export type MyWorkApplication = {
  id: string;
  status: JobApplicationStatus;
  createdAt: string;
  job: Job | null;
};
