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
