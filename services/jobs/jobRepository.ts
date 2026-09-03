import { supabase } from '../../lib/supabase';

import { adaptJobRow } from './jobAdapter';

import {
  JOB_CATEGORIES,
  JOB_PAY_TYPES,
  JOB_TYPES,
  JOB_WORK_SITES,
  type CreateOpenJobInput,
  type Job,
  type JobPosterRow,
  type JobRow,
  type ListOpenJobsInput,
  type ViewerJobRegion,
} from '../../types/jobs';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const JOB_SELECT_COLUMNS =
  'id, title, description, category, job_type, status, pay_type, pay_amount, pay_min, pay_max, suburb, state, work_site, starts_on, published_at, created_at, poster_id';

const JOB_SELECT_WITH_POSTER = `${JOB_SELECT_COLUMNS}, poster:profiles!jobs_poster_id_fkey ( id, display_name, avatar_path, account_type )`;

const PROFILE_SELECT =
  'id, display_name, avatar_path, account_type';

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value.toLowerCase());
}

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

function formatCreateJobError(
  error: {
    message?: string;
    code?: string;
  } | null,
): string {
  if (!error?.message) {
    return 'This job could not be published. Try again.';
  }

  const message =
    error.message.toLowerCase();
  const code = error.code ?? '';

  if (
    code === '42501' ||
    message.includes(
      'row-level security',
    )
  ) {
    return 'You do not have permission to publish this job.';
  }

  if (
    message.includes(
      'jobs_title_length',
    )
  ) {
    return 'The job title must be between 3 and 80 characters.';
  }

  if (
    message.includes(
      'jobs_description_length',
    )
  ) {
    return 'The description must be between 10 and 4,000 characters.';
  }

  if (
    message.includes(
      'jobs_suburb_length',
    ) ||
    message.includes(
      'jobs_state_length',
    )
  ) {
    return 'Check the suburb and state, then try again.';
  }

  if (
    message.includes(
      'jobs_pay_required',
    ) ||
    message.includes(
      'jobs_pay_values',
    )
  ) {
    return 'Enter a valid pay amount, or choose Negotiable.';
  }

  return 'This job could not be published. Try again.';
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

function formatOwnedJobsError(): string {
  return 'Your jobs could not be loaded. Try again.';
}

export async function listJobsByIds(
  jobIds: string[],
): Promise<{
  jobs: Job[];
  error: string | null;
}> {
  const uniqueIds = [
    ...new Set(
      jobIds
        .map((id) => id.trim().toLowerCase())
        .filter((id) => isUuid(id)),
    ),
  ];

  if (uniqueIds.length === 0) {
    return {
      jobs: [],
      error: null,
    };
  }

  const result = await supabase
    .from('jobs')
    .select(JOB_SELECT_COLUMNS)
    .in('id', uniqueIds);

  if (result.error) {
    return {
      jobs: [],
      error: formatOwnedJobsError(),
    };
  }

  const jobRows = (result.data ?? []).filter(
    isJobRow,
  );

  return {
    jobs: jobRows.map((row) => adaptJobRow(row)),
    error: null,
  };
}

export async function listMyPostedJobs(): Promise<{
  jobs: Job[];
  error: string | null;
}> {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      jobs: [],
      error: 'Sign in to view jobs you have posted.',
    };
  }

  const result = await supabase
    .from('jobs')
    .select(JOB_SELECT_COLUMNS)
    .eq('poster_id', userId)
    .order('created_at', {
      ascending: false,
    });

  if (result.error) {
    return {
      jobs: [],
      error: formatOwnedJobsError(),
    };
  }

  const jobRows = (result.data ?? []).filter(
    isJobRow,
  );

  return {
    jobs: jobRows.map((row) => adaptJobRow(row)),
    error: null,
  };
}

export async function listMyAssignedJobs(): Promise<{
  jobs: Job[];
  error: string | null;
}> {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      jobs: [],
      error: 'Sign in to view assigned work.',
    };
  }

  const result = await supabase
    .from('jobs')
    .select(JOB_SELECT_COLUMNS)
    .eq('assigned_user_id', userId)
    .eq('status', 'assigned')
    .order('assigned_at', {
      ascending: false,
    });

  if (result.error) {
    return {
      jobs: [],
      error: formatOwnedJobsError(),
    };
  }

  const jobRows = (result.data ?? []).filter(
    isJobRow,
  );

  return {
    jobs: jobRows.map((row) => adaptJobRow(row)),
    error: null,
  };
}

function sanitiseCreateInput(
  input: CreateOpenJobInput,
):
  | {
      ok: true;
      title: string;
      description: string;
      suburb: string;
      state: string;
      payAmount: number | null;
      workSite: CreateOpenJobInput['workSite'];
    }
  | {
      ok: false;
      error: string;
    } {
  const title = input.title.trim();
  const description =
    input.description.trim();
  const suburb = input.suburb.trim();
  const state = input.state.trim();

  if (
    title.length < 3 ||
    title.length > 80
  ) {
    return {
      ok: false,
      error:
        'The job title must be between 3 and 80 characters.',
    };
  }

  if (
    description.length < 10 ||
    description.length > 4000
  ) {
    return {
      ok: false,
      error:
        'The description must be between 10 and 4,000 characters.',
    };
  }

  if (
    suburb.length < 1 ||
    suburb.length > 60
  ) {
    return {
      ok: false,
      error:
        'Enter a suburb between 1 and 60 characters.',
    };
  }

  if (
    state.length < 1 ||
    state.length > 40
  ) {
    return {
      ok: false,
      error:
        'Enter a state between 1 and 40 characters.',
    };
  }

  if (
    !JOB_CATEGORIES.includes(
      input.category,
    ) ||
    !JOB_TYPES.includes(
      input.jobType,
    ) ||
    !JOB_PAY_TYPES.includes(
      input.payType,
    )
  ) {
    return {
      ok: false,
      error:
        'Choose a valid category, job type, and pay type.',
    };
  }

  const workSite = input.workSite ?? null;

  if (
    workSite !== null &&
    !JOB_WORK_SITES.includes(workSite)
  ) {
    return {
      ok: false,
      error:
        'Choose a valid work site.',
    };
  }

  if (input.payType === 'negotiable') {
    return {
      ok: true,
      title,
      description,
      suburb,
      state,
      payAmount: null,
      workSite,
    };
  }

  const payAmount = input.payAmount;

  if (
    typeof payAmount !== 'number' ||
    !Number.isFinite(payAmount) ||
    payAmount <= 0 ||
    payAmount > 9_999_999_999.99
  ) {
    return {
      ok: false,
      error:
        'Enter a valid pay amount greater than 0.',
    };
  }

  const rounded =
    Math.round(payAmount * 100) / 100;

  if (
    Math.abs(payAmount - rounded) >
    0.001
  ) {
    return {
      ok: false,
      error:
        'Enter a valid amount with up to two decimal places.',
    };
  }

  return {
    ok: true,
    title,
    description,
    suburb,
    state,
    payAmount: rounded,
    workSite,
  };
}

export async function createOpenJob(
  input: CreateOpenJobInput,
): Promise<{
  job: Job | null;
  error: string | null;
}> {
  const {
    data: userData,
  } =
    await supabase.auth.getUser();

  const userId = userData.user?.id;

  if (!userId) {
    return {
      job: null,
      error:
        'Sign in to publish a job.',
    };
  }

  const sanitised =
    sanitiseCreateInput(input);

  if (!sanitised.ok) {
    return {
      job: null,
      error: sanitised.error,
    };
  }

  const payload = {
    poster_id: userId,
    title: sanitised.title,
    description: sanitised.description,
    category: input.category,
    job_type: input.jobType,
    pay_type: input.payType,
    pay_amount: sanitised.payAmount,
    suburb: sanitised.suburb,
    state: sanitised.state,
    work_site: sanitised.workSite,
  };

  const inserted = await supabase
    .from('jobs')
    .insert(payload)
    .select(JOB_SELECT_COLUMNS)
    .maybeSingle();

  if (inserted.error) {
    return {
      job: null,
      error: formatCreateJobError(
        inserted.error,
      ),
    };
  }

  const row = inserted.data;

  if (!isJobRow(row)) {
    return {
      job: null,
      error:
        'This job could not be published. Try again.',
    };
  }

  const postersById =
    await fetchPostersById([
      row.poster_id,
    ]);

  return {
    job: adaptJobRow(row, postersById),
    error: null,
  };
}
