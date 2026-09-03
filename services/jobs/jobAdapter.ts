import type {
  Job,
  JobAccountType,
  JobApplicationStatus,
  JobCategory,
  JobPayType,
  JobPosterPreview,
  JobPosterRow,
  JobRow,
  JobType,
  JobWorkSite,
} from '../../types/jobs';

const CATEGORY_LABELS: Record<
  JobCategory,
  string
> = {
  trades: 'Trades',
  labour: 'Labour',
  landscaping: 'Landscaping',
  cleaning: 'Cleaning',
  hospitality: 'Hospitality',
  admin: 'Admin',
  delivery: 'Delivery',
  automotive: 'Automotive',
  care: 'Care',
  other: 'Other',
};

const JOB_TYPE_LABELS: Record<
  JobType,
  string
> = {
  one_off: 'One-off',
  casual: 'Casual',
  part_time: 'Part-time',
  full_time: 'Full-time',
  contract: 'Contract',
};

const WORK_SITE_LABELS: Record<
  JobWorkSite,
  string
> = {
  on_site: 'On site',
  remote: 'Remote',
  hybrid: 'Hybrid',
};

const PREVIEW_LENGTH = 110;

function toNumber(
  value: number | string | null,
): number | null {
  if (value === null) {
    return null;
  }

  const parsed =
    typeof value === 'number'
      ? value
      : Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function formatMoney(
  value: number,
): string {
  const hasCents =
    Math.round(value * 100) %
      100 !==
    0;

  return `$${value.toLocaleString(
    'en-AU',
    {
      minimumFractionDigits:
        hasCents ? 2 : 0,
      maximumFractionDigits:
        hasCents ? 2 : 0,
    },
  )}`;
}

function paySuffix(
  payType: JobPayType,
): string {
  if (payType === 'hourly') {
    return '/hr';
  }

  if (payType === 'daily') {
    return '/day';
  }

  return '';
}

export function formatJobPay(
  payType: JobPayType,
  payAmount: number | string | null,
  payMin: number | string | null,
  payMax: number | string | null,
): string {
  const amount = toNumber(payAmount);
  const min = toNumber(payMin);
  const max = toNumber(payMax);
  const suffix = paySuffix(payType);

  if (amount !== null) {
    return `${formatMoney(amount)}${suffix}`;
  }

  if (min !== null && max !== null) {
    return `${formatMoney(min)}–${formatMoney(max)}${suffix}`;
  }

  if (min !== null) {
    return `From ${formatMoney(min)}${suffix}`;
  }

  if (max !== null) {
    return `Up to ${formatMoney(max)}${suffix}`;
  }

  if (payType === 'negotiable') {
    return 'Negotiable';
  }

  if (payType === 'salary') {
    return 'Salary';
  }

  if (payType === 'fixed') {
    return 'Fixed pay';
  }

  if (payType === 'hourly') {
    return 'Hourly';
  }

  return 'Daily';
}

export function formatJobCategory(
  category: JobCategory,
): string {
  return CATEGORY_LABELS[category];
}

export function formatJobType(
  jobType: JobType,
): string {
  return JOB_TYPE_LABELS[jobType];
}

export function formatWorkSite(
  workSite: JobWorkSite | null,
): string | null {
  if (!workSite) {
    return null;
  }

  return WORK_SITE_LABELS[workSite];
}

export function formatJobLocation(
  suburb: string,
  state: string,
): string {
  const trimmedSuburb =
    suburb.trim();
  const trimmedState =
    state.trim();

  if (
    trimmedSuburb &&
    trimmedState
  ) {
    return `${trimmedSuburb}, ${trimmedState}`;
  }

  return (
    trimmedSuburb ||
    trimmedState ||
    'Location not set'
  );
}

export function formatPostedLabel(
  isoDate: string,
  now = Date.now(),
): string {
  const then = Date.parse(isoDate);

  if (!Number.isFinite(then)) {
    return '';
  }

  const deltaSeconds = Math.max(
    0,
    Math.floor((now - then) / 1000),
  );

  if (deltaSeconds < 45) {
    return 'Just now';
  }

  const minutes = Math.floor(
    deltaSeconds / 60,
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days === 1) {
    return 'Yesterday';
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(then).toLocaleDateString(
    'en-AU',
    {
      day: 'numeric',
      month: 'short',
    },
  );
}

export function formatStartsOn(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);

  if (!Number.isFinite(parsed)) {
    return value;
  }

  return new Date(parsed).toLocaleDateString(
    'en-AU',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );
}

export function formatApplicationStatus(
  status: JobApplicationStatus,
): string {
  if (status === 'submitted') {
    return 'Submitted';
  }

  if (status === 'withdrawn') {
    return 'Withdrawn';
  }

  if (status === 'declined') {
    return 'Declined';
  }

  if (status === 'selected') {
    return 'Selected';
  }

  if (status === 'not_selected') {
    return 'Not selected';
  }

  return 'Cancelled';
}

export function previewApplicationMessage(
  message: string | null,
): string {
  const collapsed = (message ?? '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!collapsed) {
    return 'No message included.';
  }

  if (collapsed.length <= 90) {
    return collapsed;
  }

  return `${collapsed.slice(0, 90).trimEnd()}…`;
}

export function posterInitials(
  displayName: string,
): string {
  const parts = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'DG';
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`
    .toUpperCase();
}

function previewDescription(
  description: string,
): string {
  const collapsed = description
    .trim()
    .replace(/\s+/g, ' ');

  if (collapsed.length <= PREVIEW_LENGTH) {
    return collapsed;
  }

  return `${collapsed.slice(0, PREVIEW_LENGTH).trimEnd()}…`;
}

function unwrapPoster(
  poster: JobRow['poster'],
): JobPosterRow | null {
  if (!poster) {
    return null;
  }

  if (Array.isArray(poster)) {
    return poster[0] ?? null;
  }

  return poster;
}

function toPosterPreview(
  poster: JobPosterRow | null,
): JobPosterPreview | null {
  if (!poster?.id) {
    return null;
  }

  const displayName =
    poster.display_name.trim() ||
    'Direct Gain member';

  const accountType: JobAccountType =
    poster.account_type === 'business'
      ? 'business'
      : 'personal';

  return {
    id: poster.id,
    displayName,
    avatarPath:
      poster.avatar_path,
    accountType,
  };
}

export function adaptJobRow(
  row: JobRow,
  postersById?: Map<string, JobPosterRow>,
): Job {
  const joined = unwrapPoster(row.poster);
  const fallback =
    postersById?.get(row.poster_id) ??
    null;
  const poster = toPosterPreview(
    joined ?? fallback,
  );
  const publishedAt =
    row.published_at ||
    row.created_at;

  return {
    id: row.id,
    title: row.title.trim(),
    description: row.description.trim(),
    descriptionPreview:
      previewDescription(
        row.description,
      ),
    category: row.category,
    categoryLabel: formatJobCategory(
      row.category,
    ),
    jobType: row.job_type,
    jobTypeLabel: formatJobType(
      row.job_type,
    ),
    status: row.status,
    payType: row.pay_type,
    payLabel: formatJobPay(
      row.pay_type,
      row.pay_amount,
      row.pay_min,
      row.pay_max,
    ),
    suburb: row.suburb,
    state: row.state,
    locationLabel: formatJobLocation(
      row.suburb,
      row.state,
    ),
    workSite: row.work_site,
    workSiteLabel: formatWorkSite(
      row.work_site,
    ),
    startsOn: row.starts_on,
    publishedAt,
    postedLabel: formatPostedLabel(
      publishedAt,
    ),
    posterId: row.poster_id,
    poster,
  };
}

export function formatViewerRegionLabel(
  suburb: string | null,
  state: string | null,
): string {
  const trimmedSuburb =
    suburb?.trim() ?? '';
  const trimmedState =
    state?.trim() ?? '';

  if (
    trimmedSuburb &&
    trimmedState
  ) {
    return `${trimmedSuburb}, ${trimmedState}`;
  }

  if (trimmedSuburb || trimmedState) {
    return trimmedSuburb || trimmedState;
  }

  return 'Region not set';
}
