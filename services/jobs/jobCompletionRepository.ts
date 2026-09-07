import { supabase } from '../../lib/supabase';

import type { JobStatus } from '../../types/jobs';
import type {
  ConfirmJobCompletionRow,
  JobCompletionConfirmationRow,
  JobCompletionView,
} from '../../types/reviews';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

function formatCompletionError(
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
    message.includes('signed in')
  ) {
    return 'Sign in to confirm completion.';
  }

  if (
    message.includes('only the job poster or the assigned worker')
  ) {
    return 'Only the employer or assigned worker can confirm completion.';
  }

  if (
    message.includes('cancelled')
  ) {
    return 'This job was cancelled and cannot be confirmed complete.';
  }

  if (
    message.includes('only assigned work') ||
    message.includes('does not have an assigned worker')
  ) {
    return 'This job is not ready to confirm complete.';
  }

  if (
    message.includes('does not exist')
  ) {
    return 'This job could not be found.';
  }

  if (
    message.includes('row-level security') ||
    message.includes('permission')
  ) {
    return 'You do not have permission to confirm this job.';
  }

  return fallback;
}

function firstRpcRow<T>(data: unknown): T | null {
  if (Array.isArray(data)) {
    return (data[0] as T | undefined) ?? null;
  }

  if (data && typeof data === 'object') {
    return data as T;
  }

  return null;
}

export function presentJobCompletionView(input: {
  jobStatus: JobStatus;
  viewerId: string | null;
  posterId: string;
  assignedUserId: string | null;
  confirmerIds: string[];
}): JobCompletionView | null {
  const viewerId = input.viewerId?.toLowerCase() ?? null;
  const posterId = input.posterId.toLowerCase();
  const assignedUserId =
    input.assignedUserId?.toLowerCase() ?? null;

  if (!viewerId || !assignedUserId) {
    return null;
  }

  const role =
    viewerId === posterId
      ? 'poster'
      : viewerId === assignedUserId
        ? 'worker'
        : null;

  if (!role) {
    return null;
  }

  if (
    input.jobStatus !== 'assigned' &&
    input.jobStatus !== 'completed'
  ) {
    return null;
  }

  const confirmed = new Set(
    input.confirmerIds.map(id => id.toLowerCase()),
  );
  const currentUserConfirmed = confirmed.has(viewerId);
  const otherPartyId =
    role === 'poster' ? assignedUserId : posterId;
  const otherPartyConfirmed = confirmed.has(otherPartyId);

  return {
    role,
    currentUserConfirmed,
    otherPartyConfirmed,
    bothConfirmed:
      currentUserConfirmed && otherPartyConfirmed,
    jobCompleted: input.jobStatus === 'completed',
  };
}

export async function getJobCompletionConfirmers(
  jobId: string,
): Promise<{
  confirmerIds: string[];
  error: string | null;
}> {
  const id = jobId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      confirmerIds: [],
      error: null,
    };
  }

  const result = await supabase
    .from('job_completion_confirmations')
    .select('confirmer_id')
    .eq('job_id', id);

  if (result.error) {
    return {
      confirmerIds: [],
      error: formatCompletionError(
        result.error,
        'Completion status could not be loaded. Try again.',
      ),
    };
  }

  const confirmerIds = (result.data ?? [])
    .map((row: JobCompletionConfirmationRow) =>
      typeof row.confirmer_id === 'string'
        ? row.confirmer_id.toLowerCase()
        : '',
    )
    .filter(isUuid);

  return {
    confirmerIds,
    error: null,
  };
}

export async function confirmJobCompletion(
  jobId: string,
): Promise<{
  jobStatus: JobStatus | null;
  posterConfirmed: boolean;
  workerConfirmed: boolean;
  error: string | null;
}> {
  const id = jobId.trim().toLowerCase();

  if (!isUuid(id)) {
    return {
      jobStatus: null,
      posterConfirmed: false,
      workerConfirmed: false,
      error: 'This job could not be confirmed.',
    };
  }

  const result = await supabase.rpc(
    'confirm_job_completion',
    {
      p_job_id: id,
    },
  );

  if (result.error) {
    return {
      jobStatus: null,
      posterConfirmed: false,
      workerConfirmed: false,
      error: formatCompletionError(
        result.error,
        'Completion could not be confirmed. Try again.',
      ),
    };
  }

  const row = firstRpcRow<ConfirmJobCompletionRow>(
    result.data,
  );

  const status = row?.job_status;
  const jobStatus: JobStatus | null =
    status === 'open' ||
    status === 'assigned' ||
    status === 'completed' ||
    status === 'cancelled'
      ? status
      : null;

  return {
    jobStatus,
    posterConfirmed: Boolean(row?.poster_confirmed),
    workerConfirmed: Boolean(row?.worker_confirmed),
    error: null,
  };
}
