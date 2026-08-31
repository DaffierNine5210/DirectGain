-- ============================================================
-- DIRECT GAIN
-- Jobs & Work v1 — jobs, applications, RLS, RPCs
-- Migration 005
--
-- Local file only until approved.
-- Do not apply remotely without explicit approval.
--
-- Does not modify messaging tables, Storage,
-- or migrations 001–003.
-- ============================================================


-- ============================================================
-- JOBS
-- selected_application_id is added without an FK
-- until job_applications exists, then a composite
-- FK proves the application belongs to this job.
-- ============================================================

create table if not exists public.jobs (
  id uuid
    primary key
    default gen_random_uuid(),

  poster_id uuid
    not null
    references public.profiles(id)
    on delete restrict,

  title text
    not null,

  description text
    not null,

  category text
    not null
    check (
      category in (
        'trades',
        'labour',
        'landscaping',
        'cleaning',
        'hospitality',
        'admin',
        'delivery',
        'automotive',
        'care',
        'other'
      )
    ),

  job_type text
    not null
    check (
      job_type in (
        'one_off',
        'casual',
        'part_time',
        'full_time',
        'contract'
      )
    ),

  status text
    not null
    default 'open'
    check (
      status in (
        'open',
        'assigned',
        'completed',
        'cancelled'
      )
    ),

  pay_type text
    not null
    check (
      pay_type in (
        'hourly',
        'daily',
        'fixed',
        'salary',
        'negotiable'
      )
    ),

  pay_amount numeric(12, 2),

  pay_min numeric(12, 2),

  pay_max numeric(12, 2),

  suburb text
    not null,

  state text
    not null,

  work_site text
    check (
      work_site is null
      or work_site in (
        'on_site',
        'remote',
        'hybrid'
      )
    ),

  starts_on date,

  selected_application_id uuid,

  assigned_user_id uuid
    references public.profiles(id)
    on delete restrict,

  published_at timestamptz
    not null
    default now(),

  assigned_at timestamptz,

  completed_at timestamptz,

  cancelled_at timestamptz,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  constraint jobs_title_length_check
    check (
      char_length(trim(title))
        between 3 and 80
    ),

  constraint jobs_description_length_check
    check (
      char_length(trim(description))
        between 10 and 4000
    ),

  constraint jobs_suburb_length_check
    check (
      char_length(trim(suburb))
        between 1 and 60
    ),

  constraint jobs_state_length_check
    check (
      char_length(trim(state))
        between 1 and 40
    ),

  constraint jobs_pay_values_check
    check (
      (
        pay_amount is null
        or pay_amount > 0
      )
      and (
        pay_min is null
        or pay_min > 0
      )
      and (
        pay_max is null
        or pay_max > 0
      )
      and (
        pay_min is null
        or pay_max is null
        or pay_max >= pay_min
      )
    ),

  constraint jobs_pay_required_check
    check (
      pay_type = 'negotiable'
      or pay_amount is not null
      or (
        pay_min is not null
        and pay_max is not null
      )
    ),

  constraint jobs_assignment_pair_check
    check (
      (
        selected_application_id is null
        and assigned_user_id is null
      )
      or (
        selected_application_id is not null
        and assigned_user_id is not null
      )
    ),

  constraint jobs_lifecycle_check
    check (
      (
        status = 'open'
        and selected_application_id is null
        and assigned_user_id is null
        and assigned_at is null
        and completed_at is null
        and cancelled_at is null
      )
      or (
        status = 'assigned'
        and selected_application_id is not null
        and assigned_user_id is not null
        and assigned_at is not null
        and completed_at is null
        and cancelled_at is null
      )
      or (
        status = 'completed'
        and selected_application_id is not null
        and assigned_user_id is not null
        and assigned_at is not null
        and completed_at is not null
        and cancelled_at is null
      )
      or (
        status = 'cancelled'
        and cancelled_at is not null
        and completed_at is null
        and (
          (
            selected_application_id is null
            and assigned_user_id is null
            and assigned_at is null
          )
          or (
            selected_application_id is not null
            and assigned_user_id is not null
            and assigned_at is not null
          )
        )
      )
    )
);


-- ============================================================
-- APPLICATIONS
-- ============================================================

create table if not exists public.job_applications (
  id uuid
    primary key
    default gen_random_uuid(),

  job_id uuid
    not null
    references public.jobs(id)
    on delete cascade,

  applicant_id uuid
    not null
    references public.profiles(id)
    on delete restrict,

  status text
    not null
    default 'submitted'
    check (
      status in (
        'submitted',
        'withdrawn',
        'declined',
        'selected',
        'not_selected',
        'cancelled'
      )
    ),

  message text,

  conversation_id uuid
    references public.conversations(id)
    on delete set null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  withdrawn_at timestamptz,

  decided_at timestamptz,

  constraint job_applications_unique_applicant
    unique (job_id, applicant_id),

  constraint job_applications_id_job_id_key
    unique (id, job_id),

  constraint job_applications_id_applicant_id_key
    unique (id, applicant_id),

  constraint job_applications_message_length_check
    check (
      message is null
      or char_length(message) <= 500
    )
);


-- Same-job selected application (not merely "an application exists").
alter table public.jobs
  add constraint jobs_selected_application_same_job_fk
  foreign key (
    selected_application_id,
    id
  )
  references public.job_applications (
    id,
    job_id
  );

-- Assigned worker must be that application's applicant.
alter table public.jobs
  add constraint jobs_assigned_matches_applicant_fk
  foreign key (
    selected_application_id,
    assigned_user_id
  )
  references public.job_applications (
    id,
    applicant_id
  );


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists
  jobs_status_created_idx
on public.jobs(status, created_at desc);

create index if not exists
  jobs_poster_status_idx
on public.jobs(poster_id, status);

create index if not exists
  jobs_state_suburb_idx
on public.jobs(state, suburb);

create index if not exists
  jobs_category_status_idx
on public.jobs(category, status);

create index if not exists
  jobs_assigned_user_idx
on public.jobs(assigned_user_id)
where assigned_user_id is not null;

create index if not exists
  job_applications_job_status_idx
on public.job_applications(job_id, status);

create index if not exists
  job_applications_applicant_idx
on public.job_applications(applicant_id, created_at desc);

create index if not exists
  job_applications_conversation_idx
on public.job_applications(conversation_id)
where conversation_id is not null;


-- ============================================================
-- UPDATED_AT
-- ============================================================

drop trigger if exists
  jobs_set_updated_at
on public.jobs;

create trigger
  jobs_set_updated_at
before update
on public.jobs
for each row
execute function public.set_updated_at();

drop trigger if exists
  job_applications_set_updated_at
on public.job_applications;

create trigger
  job_applications_set_updated_at
before update
on public.job_applications
for each row
execute function public.set_updated_at();


-- ============================================================
-- LIFECYCLE GUARD
-- Authenticated/anon clients cannot change
-- status or assignment columns. SECURITY DEFINER
-- RPCs run as the function owner, so those
-- updates are allowed. Do not use a session GUC:
-- set_config is available to ordinary roles.
-- ============================================================

create or replace function public.jobs_protect_lifecycle()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    current_user
      not in (
        'authenticated',
        'anon'
      )
  then
    return new;
  end if;

  if
    new.status is distinct from old.status
    or new.selected_application_id
      is distinct from old.selected_application_id
    or new.assigned_user_id
      is distinct from old.assigned_user_id
    or new.assigned_at
      is distinct from old.assigned_at
    or new.completed_at
      is distinct from old.completed_at
    or new.cancelled_at
      is distinct from old.cancelled_at
    or new.poster_id
      is distinct from old.poster_id
    or new.published_at
      is distinct from old.published_at
  then
    raise exception
      'Job lifecycle fields can only change through Direct Gain RPCs.';
  end if;

  return new;
end;
$$;


create or replace function public.job_applications_protect_lifecycle()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    current_user
      not in (
        'authenticated',
        'anon'
      )
  then
    return new;
  end if;

  if
    new.status is distinct from old.status
    or new.applicant_id
      is distinct from old.applicant_id
    or new.job_id
      is distinct from old.job_id
    or new.withdrawn_at
      is distinct from old.withdrawn_at
    or new.decided_at
      is distinct from old.decided_at
  then
    raise exception
      'Application lifecycle fields can only change through Direct Gain RPCs.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  jobs_protect_lifecycle
on public.jobs;

create trigger
  jobs_protect_lifecycle
before update
on public.jobs
for each row
execute function public.jobs_protect_lifecycle();

drop trigger if exists
  job_applications_protect_lifecycle
on public.job_applications;

create trigger
  job_applications_protect_lifecycle
before update
on public.job_applications
for each row
execute function public.job_applications_protect_lifecycle();


-- ============================================================
-- SELF-APPLY + OPEN-JOB INSERT GUARDS
-- ============================================================

create or replace function public.job_applications_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  job_poster uuid;
  job_status text;
begin
  select
    poster_id,
    status
  into
    job_poster,
    job_status
  from public.jobs
  where id = new.job_id
  for share;

  if job_poster is null then
    raise exception
      'That job does not exist.';
  end if;

  if new.applicant_id = job_poster then
    raise exception
      'You cannot apply to your own job.';
  end if;

  if job_status is distinct from 'open' then
    raise exception
      'Applications are only accepted on open jobs.';
  end if;

  if new.status is distinct from 'submitted' then
    raise exception
      'Applications must start as submitted.';
  end if;

  return new;
end;
$$;


drop trigger if exists
  job_applications_before_insert
on public.job_applications;

create trigger
  job_applications_before_insert
before insert
on public.job_applications
for each row
execute function public.job_applications_before_insert();


-- ============================================================
-- RLS HELPERS
-- SECURITY DEFINER so jobs <-> applications
-- policies do not recurse. Each helper still
-- keys off auth.uid().
-- ============================================================

create or replace function public.is_job_poster(
  target_job_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.jobs
    where id = target_job_id
      and poster_id = auth.uid()
  );
$$;


create or replace function public.is_open_job(
  target_job_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.jobs
    where id = target_job_id
      and status = 'open'
  );
$$;


create or replace function public.can_read_job(
  target_job_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.jobs as jobs
    where jobs.id = target_job_id
      and (
        jobs.status in (
          'open',
          'assigned',
          'completed'
        )
        or jobs.poster_id = auth.uid()
        or jobs.assigned_user_id = auth.uid()
        or exists (
          select 1
          from public.job_applications as applications
          where applications.job_id = jobs.id
            and applications.applicant_id = auth.uid()
        )
      )
  );
$$;


-- ============================================================
-- RLS
-- ============================================================

alter table public.jobs
enable row level security;

alter table public.job_applications
enable row level security;

revoke all
on table public.jobs
from public;

revoke all
on table public.jobs
from anon;

revoke all
on table public.jobs
from authenticated;

revoke all
on table public.job_applications
from public;

revoke all
on table public.job_applications
from anon;

revoke all
on table public.job_applications
from authenticated;

grant select, insert
on table public.jobs
to authenticated;

grant update (
  title,
  description,
  category,
  job_type,
  pay_type,
  pay_amount,
  pay_min,
  pay_max,
  suburb,
  state,
  work_site,
  starts_on
)
on table public.jobs
to authenticated;

grant select, insert
on table public.job_applications
to authenticated;


drop policy if exists
  "Authenticated users can read visible jobs"
on public.jobs;

create policy
  "Authenticated users can read visible jobs"
on public.jobs
for select
to authenticated
using (
  public.can_read_job(id)
);


drop policy if exists
  "Users can create their own open jobs"
on public.jobs;

create policy
  "Users can create their own open jobs"
on public.jobs
for insert
to authenticated
with check (
  poster_id = auth.uid()
  and status = 'open'
  and selected_application_id is null
  and assigned_user_id is null
  and assigned_at is null
  and completed_at is null
  and cancelled_at is null
);


drop policy if exists
  "Posters can edit ordinary fields on open jobs"
on public.jobs;

create policy
  "Posters can edit ordinary fields on open jobs"
on public.jobs
for update
to authenticated
using (
  poster_id = auth.uid()
  and status = 'open'
)
with check (
  poster_id = auth.uid()
  and status = 'open'
  and selected_application_id is null
  and assigned_user_id is null
);


drop policy if exists
  "Applicants and posters can read applications"
on public.job_applications;

create policy
  "Applicants and posters can read applications"
on public.job_applications
for select
to authenticated
using (
  applicant_id = auth.uid()
  or public.is_job_poster(job_id)
);


drop policy if exists
  "Users can apply to other people's open jobs"
on public.job_applications;

create policy
  "Users can apply to other people's open jobs"
on public.job_applications
for insert
to authenticated
with check (
  applicant_id = auth.uid()
  and status = 'submitted'
  and conversation_id is null
  and withdrawn_at is null
  and decided_at is null
  and public.is_open_job(job_id)
  and not public.is_job_poster(job_id)
);


-- ============================================================
-- RPCs
-- ============================================================

create or replace function public.hire_job_applicant(
  p_job_id uuid,
  p_application_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked_job public.jobs%rowtype;
  locked_application public.job_applications%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to hire an applicant.';
  end if;

  select *
  into locked_job
  from public.jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception
      'That job does not exist.';
  end if;

  if locked_job.poster_id is distinct from current_user_id then
    raise exception
      'Only the job poster can hire an applicant.';
  end if;

  if locked_job.status is distinct from 'open' then
    raise exception
      'This job is no longer open for hiring.';
  end if;

  if locked_job.selected_application_id is not null then
    raise exception
      'This job already has a hired applicant.';
  end if;

  perform 1
  from public.job_applications
  where job_id = locked_job.id
  for update;

  select *
  into locked_application
  from public.job_applications
  where id = p_application_id;

  if not found then
    raise exception
      'That application does not exist.';
  end if;

  if locked_application.job_id is distinct from p_job_id then
    raise exception
      'That application does not belong to this job.';
  end if;

  if locked_application.status is distinct from 'submitted' then
    raise exception
      'Only a submitted application can be hired.';
  end if;

  if locked_application.applicant_id = locked_job.poster_id then
    raise exception
      'A poster cannot be hired on their own job.';
  end if;

  update public.job_applications
  set
    status = 'selected',
    decided_at = now()
  where id = locked_application.id;

  update public.job_applications
  set
    status = 'not_selected',
    decided_at = now()
  where job_id = locked_job.id
    and id is distinct from locked_application.id
    and status = 'submitted';

  update public.jobs
  set
    status = 'assigned',
    selected_application_id = locked_application.id,
    assigned_user_id = locked_application.applicant_id,
    assigned_at = now()
  where id = locked_job.id;

  return locked_job.id;
end;
$$;


create or replace function public.complete_job(
  p_job_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked_job public.jobs%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to complete a job.';
  end if;

  select *
  into locked_job
  from public.jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception
      'That job does not exist.';
  end if;

  if locked_job.poster_id is distinct from current_user_id then
    raise exception
      'Only the job poster can mark work completed.';
  end if;

  if locked_job.status is distinct from 'assigned' then
    raise exception
      'Only an assigned job can be marked completed.';
  end if;

  update public.jobs
  set
    status = 'completed',
    completed_at = now()
  where id = locked_job.id;

  return locked_job.id;
end;
$$;


create or replace function public.cancel_job(
  p_job_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked_job public.jobs%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to cancel a job.';
  end if;

  select *
  into locked_job
  from public.jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception
      'That job does not exist.';
  end if;

  if locked_job.poster_id is distinct from current_user_id then
    raise exception
      'Only the job poster can cancel a job.';
  end if;

  if locked_job.status not in ('open', 'assigned') then
    raise exception
      'This job can no longer be cancelled.';
  end if;

  update public.job_applications
  set
    status = 'cancelled',
    decided_at = coalesce(decided_at, now())
  where job_id = locked_job.id
    and status = 'submitted';

  update public.jobs
  set
    status = 'cancelled',
    cancelled_at = now()
  where id = locked_job.id;

  return locked_job.id;
end;
$$;


create or replace function public.withdraw_job_application(
  p_application_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked_application public.job_applications%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to withdraw an application.';
  end if;

  select *
  into locked_application
  from public.job_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception
      'That application does not exist.';
  end if;

  if locked_application.applicant_id is distinct from current_user_id then
    raise exception
      'Only the applicant can withdraw this application.';
  end if;

  if locked_application.status is distinct from 'submitted' then
    raise exception
      'Only a submitted application can be withdrawn.';
  end if;

  update public.job_applications
  set
    status = 'withdrawn',
    withdrawn_at = now()
  where id = locked_application.id;

  return locked_application.id;
end;
$$;


create or replace function public.decline_job_application(
  p_application_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked_application public.job_applications%rowtype;
  locked_job public.jobs%rowtype;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to decline an application.';
  end if;

  select *
  into locked_application
  from public.job_applications
  where id = p_application_id;

  if not found then
    raise exception
      'That application does not exist.';
  end if;

  select *
  into locked_job
  from public.jobs
  where id = locked_application.job_id
  for update;

  if not found then
    raise exception
      'That job does not exist.';
  end if;

  select *
  into locked_application
  from public.job_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception
      'That application does not exist.';
  end if;

  if locked_job.poster_id is distinct from current_user_id then
    raise exception
      'Only the job poster can decline an application.';
  end if;

  if locked_job.status is distinct from 'open' then
    raise exception
      'Applications can only be declined while the job is open.';
  end if;

  if locked_application.status is distinct from 'submitted' then
    raise exception
      'Only a submitted application can be declined.';
  end if;

  update public.job_applications
  set
    status = 'declined',
    decided_at = now()
  where id = locked_application.id;

  return locked_application.id;
end;
$$;


-- ============================================================
-- FUNCTION GRANTS
-- ============================================================

revoke all on function public.jobs_protect_lifecycle() from public;
revoke all on function public.jobs_protect_lifecycle() from anon;
revoke all on function public.jobs_protect_lifecycle() from authenticated;

revoke all on function public.job_applications_protect_lifecycle() from public;
revoke all on function public.job_applications_protect_lifecycle() from anon;
revoke all on function public.job_applications_protect_lifecycle() from authenticated;

revoke all on function public.job_applications_before_insert() from public;
revoke all on function public.job_applications_before_insert() from anon;
revoke all on function public.job_applications_before_insert() from authenticated;

revoke all on function public.is_job_poster(uuid) from public;
revoke all on function public.is_job_poster(uuid) from anon;
grant execute on function public.is_job_poster(uuid) to authenticated;

revoke all on function public.is_open_job(uuid) from public;
revoke all on function public.is_open_job(uuid) from anon;
grant execute on function public.is_open_job(uuid) to authenticated;

revoke all on function public.can_read_job(uuid) from public;
revoke all on function public.can_read_job(uuid) from anon;
grant execute on function public.can_read_job(uuid) to authenticated;

revoke all on function public.hire_job_applicant(uuid, uuid) from public;
revoke all on function public.hire_job_applicant(uuid, uuid) from anon;
grant execute on function public.hire_job_applicant(uuid, uuid) to authenticated;

revoke all on function public.complete_job(uuid) from public;
revoke all on function public.complete_job(uuid) from anon;
grant execute on function public.complete_job(uuid) to authenticated;

revoke all on function public.cancel_job(uuid) from public;
revoke all on function public.cancel_job(uuid) from anon;
grant execute on function public.cancel_job(uuid) to authenticated;

revoke all on function public.withdraw_job_application(uuid) from public;
revoke all on function public.withdraw_job_application(uuid) from anon;
grant execute on function public.withdraw_job_application(uuid) to authenticated;

revoke all on function public.decline_job_application(uuid) from public;
revoke all on function public.decline_job_application(uuid) from anon;
grant execute on function public.decline_job_application(uuid) to authenticated;
