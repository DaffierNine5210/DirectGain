import { supabase } from '../../lib/supabase';

import {
  JOB_APPLICATION_MESSAGE_MAX,
  JOB_APPLICATION_MESSAGE_MIN,
  JOB_APPLICATION_STATUSES,
  type JobApplication,
  type JobApplicationStatus,
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
