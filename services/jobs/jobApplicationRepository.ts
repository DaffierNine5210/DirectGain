import { supabase } from '../../lib/supabase';

import { getJobById, listJobsByIds } from './jobRepository';

import {
  JOB_APPLICATION_MESSAGE_MAX,
  JOB_APPLICATION_MESSAGE_MIN,
  JOB_APPLICATION_STATUSES,
  type JobApplicantProfile,
  type JobApplication,
  type JobApplicationStatus,
  type PosterJobApplication,
  type MyWorkApplication,
} from '../../types/jobs';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const APPLICATION_SELECT =
  'id, job_id, applicant_id, status, created_at';

type JobApplicationRow = {
  id: string;
  job_id: string;
  applicant_id: string;
  status: string;
  created_at: string;
};

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

function isApplicationStatus(
  value: string,
): value is JobApplicationStatus {
  return (
    JOB_APPLICATION_STATUSES as readonly string[]
  ).includes(value);
}

function isApplicationRow(
  value: unknown,
): value is JobApplicationRow {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false;
  }

  const row = value as JobApplicationRow;

  return (
    typeof row.id === 'string' &&
    isUuid(row.id) &&
    typeof row.job_id === 'string' &&
    isUuid(row.job_id) &&
    typeof row.applicant_id === 'string' &&
    isUuid(row.applicant_id) &&
    typeof row.status === 'string' &&
    isApplicationStatus(row.status) &&
    typeof row.created_at === 'string'
  );
}

function adaptApplication(
  row: JobApplicationRow,
): JobApplication {
  return {
    id: row.id,
    jobId: row.job_id,
    applicantId: row.applicant_id,
    status: row.status as JobApplicationStatus,
    createdAt: row.created_at,
  };
}

async function getSessionUserId(): Promise<
  string | null
> {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (!userId || !isUuid(userId)) {
    return null;
  }

  return userId.toLowerCase();
}

function formatApplicationError(
  error: {
    message?: string;
    code?: string;
  } | null,
): string {
  if (!error?.message) {
    return 'This application could not be submitted. Try again.';
  }

  const message = error.message.toLowerCase();
  const code = error.code ?? '';

  if (
    code === '23505' ||
    message.includes('job_applications_unique_applicant')
  ) {
    return 'You have already applied to this job.';
  }

  if (
    message.includes('you cannot apply to your own job')
  ) {
    return 'You cannot apply to your own job.';
  }

  if (
    message.includes('only accepted on open jobs') ||
    message.includes('no longer accepting') ||
    message.includes('is_open_job')
  ) {
    return 'This job is no longer accepting applications.';
  }

  if (
    code === '42501' ||
    message.includes('row-level security')
  ) {
    return 'This job is no longer accepting applications.';
  }

  if (
    message.includes('job_applications_message_length')
  ) {
    return 'Keep your message to 500 characters or fewer.';
  }

  return 'This application could not be submitted. Try again.';
}

export function sanitiseApplicationMessage(
  value: string,
):
  | { ok: true; message: string }
  | { ok: false; error: string } {
  const trimmed = value.trim();

  if (
    trimmed.length < JOB_APPLICATION_MESSAGE_MIN
  ) {
    return {
      ok: false,
      error:
        'Write a short message of at least 10 characters.',
    };
  }

  if (trimmed.length > JOB_APPLICATION_MESSAGE_MAX) {
    return {
      ok: false,
      error:
        'Keep your message to 500 characters or fewer.',
    };
  }

  return {
    ok: true,
    message: trimmed,
  };
}

export async function getAuthenticatedUserId(): Promise<
  string | null
> {
  return getSessionUserId();
}

export async function getMyApplicationForJob(
  jobId: string,
): Promise<{
  application: JobApplication | null;
  error: string | null;
}> {
  const id = jobId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      application: null,
      error: 'This job could not be found.',
    };
  }

  const userId = await getSessionUserId();

  if (!userId) {
    return {
      application: null,
      error: 'Sign in to apply for jobs.',
    };
  }

  const result = await supabase
    .from('job_applications')
    .select(APPLICATION_SELECT)
    .eq('job_id', id)
    .eq('applicant_id', userId)
    .maybeSingle();

  if (result.error) {
    return {
      application: null,
      error:
        'Your application status could not be loaded.',
    };
  }

  if (!result.data) {
    return {
      application: null,
      error: null,
    };
  }

  if (!isApplicationRow(result.data)) {
    return {
      application: null,
      error:
        'Your application status could not be loaded.',
    };
  }

  return {
    application: adaptApplication(result.data),
    error: null,
  };
}

export async function createJobApplication(input: {
  jobId: string;
  message: string;
}): Promise<{
  application: JobApplication | null;
  error: string | null;
}> {
  const jobId = input.jobId.trim().toLowerCase();

  if (!isUuid(jobId)) {
    return {
      application: null,
      error: 'This job could not be found.',
    };
  }

  const sanitised = sanitiseApplicationMessage(
    input.message,
  );

  if (!sanitised.ok) {
    return {
      application: null,
      error: sanitised.error,
    };
  }

  const userId = await getSessionUserId();

  if (!userId) {
    return {
      application: null,
      error: 'Sign in to apply for this job.',
    };
  }

  const inserted = await supabase
    .from('job_applications')
    .insert({
      job_id: jobId,
      applicant_id: userId,
      status: 'submitted',
      message: sanitised.message,
    })
    .select(APPLICATION_SELECT)
    .maybeSingle();

  if (inserted.error) {
    const duplicate =
      inserted.error.code === '23505' ||
      inserted.error.message
        .toLowerCase()
        .includes('job_applications_unique_applicant');

    if (duplicate) {
      const existing = await getMyApplicationForJob(jobId);

      if (existing.application) {
        return {
          application: existing.application,
          error: null,
        };
      }
    }

    return {
      application: null,
      error: formatApplicationError(inserted.error),
    };
  }

  if (!isApplicationRow(inserted.data)) {
    return {
      application: null,
      error:
        'This application could not be submitted. Try again.',
    };
  }

  return {
    application: adaptApplication(inserted.data),
    error: null,
  };
}

export async function withdrawJobApplication(
  applicationId: string,
): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const id = applicationId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      ok: false,
      error: 'This application could not be updated.',
    };
  }

  const userId = await getSessionUserId();

  if (!userId) {
    return {
      ok: false,
      error: 'Sign in to withdraw your application.',
    };
  }

  const result = await supabase.rpc(
    'withdraw_job_application',
    {
      p_application_id: id,
    },
  );

  if (result.error) {
    const message =
      result.error.message.toLowerCase();

    if (message.includes('only a submitted')) {
      return {
        ok: false,
        error:
          'Only a submitted application can be withdrawn.',
      };
    }

    if (message.includes('only the applicant')) {
      return {
        ok: false,
        error:
          'Only you can withdraw this application.',
      };
    }

    return {
      ok: false,
      error:
        'Your application could not be withdrawn. Try again.',
    };
  }

  return {
    ok: true,
    error: null,
  };
}

function applicationWorkRank(
  status: JobApplicationStatus,
): number {
  if (status === 'selected') {
    return 0;
  }

  if (status === 'submitted') {
    return 1;
  }

  return 2;
}

export async function listMyApplications(): Promise<{
  applications: MyWorkApplication[];
  error: string | null;
}> {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      applications: [],
      error: 'Sign in to view your applications.',
    };
  }

  const result = await supabase
    .from('job_applications')
    .select(APPLICATION_SELECT)
    .eq('applicant_id', userId)
    .order('created_at', {
      ascending: false,
    });

  if (result.error) {
    return {
      applications: [],
      error:
        'Your applications could not be loaded. Try again.',
    };
  }

  const rows = (result.data ?? []).filter(
    isApplicationRow,
  );

  const jobsResult = await listJobsByIds(
    rows.map((row) => row.job_id),
  );

  if (jobsResult.error) {
    return {
      applications: [],
      error: jobsResult.error,
    };
  }

  const jobsById = new Map(
    jobsResult.jobs.map((job) => [
      job.id.toLowerCase(),
      job,
    ]),
  );

  const applications = rows
    .map((row) => ({
      id: row.id,
      status: row.status as JobApplicationStatus,
      createdAt: row.created_at,
      job: jobsById.get(row.job_id.toLowerCase()) ?? null,
    }))
    .sort((left, right) => {
      const rank =
        applicationWorkRank(left.status) -
        applicationWorkRank(right.status);

      if (rank !== 0) {
        return rank;
      }

      return (
        Date.parse(right.createdAt) -
        Date.parse(left.createdAt)
      );
    });

  return {
    applications,
    error: null,
  };
}

const POSTER_APPLICATION_SELECT =
  'id, job_id, applicant_id, status, message, created_at';

type PosterApplicationRow = JobApplicationRow & {
  message: string | null;
};

type ApplicantProfileRow = {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_path: string | null;
  suburb: string | null;
  state: string | null;
  account_type: string;
};

function isPosterApplicationRow(
  value: unknown,
): value is PosterApplicationRow {
  if (!isApplicationRow(value)) {
    return false;
  }

  const row = value as PosterApplicationRow;

  return (
    row.message === null ||
    typeof row.message === 'string'
  );
}

function adaptApplicantProfile(
  row: ApplicantProfileRow,
): JobApplicantProfile {
  return {
    displayName:
      row.display_name.trim() ||
      'Direct Gain member',
    bio: row.bio?.trim() ? row.bio.trim() : null,
    suburb: row.suburb?.trim() ? row.suburb.trim() : null,
    state: row.state?.trim() ? row.state.trim() : null,
    accountType:
      row.account_type === 'business'
        ? 'business'
        : 'personal',
    avatarPath:
      row.avatar_path?.trim() ? row.avatar_path.trim() : null,
  };
}

async function assertPosterOwnsJob(
  jobId: string,
): Promise<
  | { ok: true }
  | { ok: false; error: string }
> {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      ok: false,
      error: 'Sign in to manage applications.',
    };
  }

  const jobResult = await getJobById(jobId);

  if (jobResult.error || !jobResult.job) {
    return {
      ok: false,
      error:
        'These applications could not be loaded.',
    };
  }

  if (jobResult.job.posterId.toLowerCase() !== userId) {
    return {
      ok: false,
      error:
        'Only the job poster can view these applications.',
    };
  }

  return { ok: true };
}

async function fetchApplicantProfiles(
  applicantIds: string[],
): Promise<Map<string, JobApplicantProfile>> {
  const uniqueIds = [
    ...new Set(
      applicantIds.filter((id) => isUuid(id)),
    ),
  ];
  const profiles = new Map<string, JobApplicantProfile>();

  if (uniqueIds.length === 0) {
    return profiles;
  }

  const result = await supabase
    .from('profiles')
    .select('id, display_name, bio, avatar_path, suburb, state, account_type')
    .in('id', uniqueIds);

  if (result.error || !result.data) {
    return profiles;
  }

  for (const row of result.data) {
    if (
      row &&
      typeof row.id === 'string' &&
      typeof row.display_name === 'string'
    ) {
      profiles.set(
        row.id.toLowerCase(),
        adaptApplicantProfile({
          ...(row as ApplicantProfileRow),
          avatar_path:
            typeof row.avatar_path === 'string'
              ? row.avatar_path
              : null,
        }),
      );
    }
  }

  return profiles;
}

function statusRank(status: JobApplicationStatus): number {
  if (status === 'submitted') {
    return 0;
  }

  if (status === 'selected') {
    return 1;
  }

  return 2;
}

export async function countSubmittedApplicationsForJob(
  jobId: string,
): Promise<{
  count: number | null;
  error: string | null;
}> {
  const id = jobId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      count: null,
      error: 'This job could not be found.',
    };
  }

  const ownership = await assertPosterOwnsJob(id);

  if (!ownership.ok) {
    return {
      count: null,
      error: ownership.error,
    };
  }

  const result = await supabase
    .from('job_applications')
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('job_id', id)
    .eq('status', 'submitted');

  if (result.error) {
    return {
      count: null,
      error: null,
    };
  }

  return {
    count: result.count ?? 0,
    error: null,
  };
}

export async function listApplicationsForJob(
  jobId: string,
): Promise<{
  applications: PosterJobApplication[];
  error: string | null;
}> {
  const id = jobId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      applications: [],
      error: 'This job could not be found.',
    };
  }

  const ownership = await assertPosterOwnsJob(id);

  if (!ownership.ok) {
    return {
      applications: [],
      error: ownership.error,
    };
  }

  const result = await supabase
    .from('job_applications')
    .select(POSTER_APPLICATION_SELECT)
    .eq('job_id', id)
    .order('created_at', { ascending: false });

  if (result.error) {
    return {
      applications: [],
      error: 'Applications could not be loaded.',
    };
  }

  const rows = (result.data ?? []).filter(
    isPosterApplicationRow,
  );

  const profiles = await fetchApplicantProfiles(
    rows.map((row) => row.applicant_id),
  );

  const applications = rows
    .map((row) => ({
      id: row.id,
      jobId: row.job_id,
      status: row.status as JobApplicationStatus,
      message: row.message,
      createdAt: row.created_at,
      applicantProfileId: row.applicant_id.toLowerCase(),
      applicant:
        profiles.get(row.applicant_id.toLowerCase()) ??
        null,
    }))
    .sort((left, right) => {
      const rank =
        statusRank(left.status) - statusRank(right.status);

      if (rank !== 0) {
        return rank;
      }

      return (
        Date.parse(right.createdAt) -
        Date.parse(left.createdAt)
      );
    });

  return {
    applications,
    error: null,
  };
}

export async function getPosterApplication(
  jobId: string,
  applicationId: string,
): Promise<{
  application: PosterJobApplication | null;
  error: string | null;
}> {
  const job = jobId.trim().toLowerCase();
  const id = applicationId.trim().toLowerCase();

  if (!isUuid(job) || !isUuid(id)) {
    return {
      application: null,
      error: 'That application could not be found.',
    };
  }

  const ownership = await assertPosterOwnsJob(job);

  if (!ownership.ok) {
    return {
      application: null,
      error: ownership.error,
    };
  }

  const result = await supabase
    .from('job_applications')
    .select(POSTER_APPLICATION_SELECT)
    .eq('job_id', job)
    .eq('id', id)
    .maybeSingle();

  if (result.error) {
    return {
      application: null,
      error: 'That application could not be loaded.',
    };
  }

  if (!isPosterApplicationRow(result.data)) {
    return {
      application: null,
      error: 'That application could not be found.',
    };
  }

  const profiles = await fetchApplicantProfiles([
    result.data.applicant_id,
  ]);

  return {
    application: {
      id: result.data.id,
      jobId: result.data.job_id,
      status: result.data.status as JobApplicationStatus,
      message: result.data.message,
      createdAt: result.data.created_at,
      applicantProfileId: result.data.applicant_id.toLowerCase(),
      applicant:
        profiles.get(result.data.applicant_id.toLowerCase()) ??
        null,
    },
    error: null,
  };
}

function formatLifecycleError(
  error: {
    message?: string;
  } | null,
  fallback: string,
): string {
  if (!error?.message) {
    return fallback;
  }

  const message = error.message.toLowerCase();

  if (
    message.includes('no longer open for hiring') ||
    message.includes('already has a hired applicant')
  ) {
    return 'This job has already been assigned.';
  }

  if (
    message.includes('only the job poster')
  ) {
    return 'Only the job poster can do this.';
  }

  if (
    message.includes('only a submitted application can be hired')
  ) {
    return 'Only a submitted application can be hired.';
  }

  if (
    message.includes('only a submitted application can be declined')
  ) {
    return 'Only a submitted application can be declined.';
  }

  if (
    message.includes('can only be declined while the job is open')
  ) {
    return 'This job is no longer open.';
  }

  return fallback;
}

export async function hireJobApplicant(input: {
  jobId: string;
  applicationId: string;
}): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const jobId = input.jobId.trim().toLowerCase();
  const applicationId = input.applicationId.trim().toLowerCase();

  if (!isUuid(jobId) || !isUuid(applicationId)) {
    return {
      ok: false,
      error: 'This applicant could not be hired.',
    };
  }

  const ownership = await assertPosterOwnsJob(jobId);

  if (!ownership.ok) {
    return {
      ok: false,
      error: ownership.error,
    };
  }

  const result = await supabase.rpc('hire_job_applicant', {
    p_job_id: jobId,
    p_application_id: applicationId,
  });

  if (result.error) {
    return {
      ok: false,
      error: formatLifecycleError(
        result.error,
        'This applicant could not be hired. Try again.',
      ),
    };
  }

  return {
    ok: true,
    error: null,
  };
}

export async function declineJobApplication(
  applicationId: string,
  jobId: string,
): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const id = applicationId.trim().toLowerCase();
  const job = jobId.trim().toLowerCase();

  if (!isUuid(id) || !isUuid(job)) {
    return {
      ok: false,
      error: 'This application could not be declined.',
    };
  }

  const ownership = await assertPosterOwnsJob(job);

  if (!ownership.ok) {
    return {
      ok: false,
      error: ownership.error,
    };
  }

  const result = await supabase.rpc(
    'decline_job_application',
    {
      p_application_id: id,
    },
  );

  if (result.error) {
    return {
      ok: false,
      error: formatLifecycleError(
        result.error,
        'This application could not be declined. Try again.',
      ),
    };
  }

  return {
    ok: true,
    error: null,
  };
}
