import { supabase } from '../../lib/supabase';

import { adaptJobRow } from './jobAdapter';

import type {
  Job,
  JobPosterRow,
  JobRow,
  ListOpenJobsInput,
  ViewerJobRegion,
} from '../../types/jobs';

const JOB_SELECT_COLUMNS =
  'id, title, description, category, job_type, status, pay_type, pay_amount, pay_min, pay_max, suburb, state, work_site, starts_on, published_at, created_at, poster_id';

const JOB_SELECT_WITH_POSTER = `${JOB_SELECT_COLUMNS}, poster:profiles!jobs_poster_id_fkey ( id, display_name, avatar_path, account_type )`;

const PROFILE_SELECT =
  'id, display_name, avatar_path, account_type';

function formatError(
  error: {
    message?: string;
    code?: string;
  } | null,
): string {
  if (!error?.message) {
    return 'The jobs feed could not be loaded.';
  }

  return error.message;
}

function isMissingRelationship(
  error: {
    code?: string;
    message?: string;
  } | null,
): boolean {
  if (!error) {
    return false;
  }

  if (
    error.code === 'PGRST200' ||
    error.code === 'PGRST201'
  ) {
    return true;
  }

  const message =
    error.message?.toLowerCase() ??
    '';

  return (
    message.includes('relationship') ||
    message.includes('could not find')
  );
}

function escapeIlike(
  value: string,
): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

function isJobRow(
  value: unknown,
): value is JobRow {
  if (
    typeof value !== 'object' ||
    value === null
  ) {
    return false;
  }

  const row = value as {
    id?: unknown;
    title?: unknown;
    status?: unknown;
  };

  return (
    typeof row.id === 'string' &&
    typeof row.title === 'string' &&
    typeof row.status === 'string'
  );
}

async function fetchPostersById(
  posterIds: string[],
): Promise<Map<string, JobPosterRow>> {
  const uniqueIds = [
    ...new Set(
      posterIds.filter(Boolean),
    ),
  ];

  const posters = new Map<
    string,
    JobPosterRow
  >();

  if (uniqueIds.length === 0) {
    return posters;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .in('id', uniqueIds);

  if (error || !data) {
    return posters;
  }

  for (const row of data) {
    if (
      row &&
      typeof row.id === 'string' &&
      typeof row.display_name ===
        'string'
    ) {
      posters.set(row.id, {
        id: row.id,
        display_name:
          row.display_name,
        avatar_path:
          typeof row.avatar_path ===
          'string'
            ? row.avatar_path
            : null,
        account_type:
          row.account_type ===
          'business'
            ? 'business'
            : 'personal',
      });
    }
  }

  return posters;
}

function hasPosterEmbed(
  row: JobRow,
): boolean {
  if (!row.poster) {
    return false;
  }

  if (Array.isArray(row.poster)) {
    return row.poster.length > 0;
  }

  return Boolean(row.poster.id);
}

export async function getViewerJobRegion(): Promise<ViewerJobRegion> {
  const {
    data: userData,
  } =
    await supabase.auth.getUser();

  const userId =
    userData.user?.id;

  if (!userId) {
    return {
      suburb: null,
      state: null,
    };
  }

  const {
    data,
    error,
  } =
    await supabase
      .from('profiles')
      .select('suburb, state')
      .eq('id', userId)
      .maybeSingle();

  if (error || !data) {
    return {
      suburb: null,
      state: null,
    };
  }

  return {
    suburb:
      typeof data.suburb === 'string' &&
      data.suburb.trim()
        ? data.suburb.trim()
        : null,
    state:
      typeof data.state === 'string' &&
      data.state.trim()
        ? data.state.trim()
        : null,
  };
}

async function queryOpenJobs(
  select: string,
  input: ListOpenJobsInput,
) {
  let query = supabase
    .from('jobs')
    .select(select)
    .eq('status', 'open')
    .order('published_at', {
      ascending: false,
    })
    .range(
      input.offset,
      input.offset + input.limit - 1,
    );

  if (input.category) {
    query = query.eq(
      'category',
      input.category,
    );
  }

  if (input.payType) {
    query = query.eq(
      'pay_type',
      input.payType,
    );
  }

  if (input.jobType) {
    query = query.eq(
      'job_type',
      input.jobType,
    );
  }

  if (input.region?.state) {
    query = query.eq(
      'state',
      input.region.state,
    );
  }

  if (input.region?.suburb) {
    query = query.eq(
      'suburb',
      input.region.suburb,
    );
  }

  const search =
    input.search?.trim();

  if (search) {
    const escaped =
      escapeIlike(search);

    query = query.or(
      `title.ilike."%${escaped}%",description.ilike."%${escaped}%"`,
    );
  }

  return query;
}

export async function listOpenJobs(
  input: ListOpenJobsInput,
): Promise<{
  jobs: Job[];
  error: string | null;
}> {
  const embedded =
    await queryOpenJobs(
      JOB_SELECT_WITH_POSTER,
      input,
    );

  let rows: unknown[] | null =
    embedded.data;
  let queryError =
    embedded.error;

  if (
    queryError &&
    isMissingRelationship(queryError)
  ) {
    const fallback =
      await queryOpenJobs(
        JOB_SELECT_COLUMNS,
        input,
      );

    rows = fallback.data;
    queryError = fallback.error;
  }

  if (queryError) {
    return {
      jobs: [],
      error: formatError(queryError),
    };
  }

  const jobRows = (rows ?? []).filter(
    isJobRow,
  );

  const missingPosterIds = jobRows
    .filter(row => !hasPosterEmbed(row))
    .map(row => row.poster_id);

  const postersById =
    await fetchPostersById(
      missingPosterIds,
    );

  return {
    jobs: jobRows.map(row =>
      adaptJobRow(row, postersById),
    ),
    error: null,
  };
}

export async function getJobById(
  jobId: string,
): Promise<{
  job: Job | null;
  error: string | null;
}> {
  const embedded = await supabase
    .from('jobs')
    .select(JOB_SELECT_WITH_POSTER)
    .eq('id', jobId)
    .maybeSingle();

  let row: unknown = embedded.data;
  let queryError = embedded.error;

  if (
    queryError &&
    isMissingRelationship(queryError)
  ) {
    const fallback = await supabase
      .from('jobs')
      .select(JOB_SELECT_COLUMNS)
      .eq('id', jobId)
      .maybeSingle();

    row = fallback.data;
    queryError = fallback.error;
  }

  if (queryError) {
    return {
      job: null,
      error: formatError(queryError),
    };
  }

  if (!isJobRow(row)) {
    return {
      job: null,
      error: null,
    };
  }

  let postersById:
    | Map<string, JobPosterRow>
    | undefined;

  if (!hasPosterEmbed(row)) {
    postersById =
      await fetchPostersById([
        row.poster_id,
      ]);
  }

  return {
    job: adaptJobRow(row, postersById),
    error: null,
  };
}
