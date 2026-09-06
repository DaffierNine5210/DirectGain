-- ============================================================
-- DIRECT GAIN
-- Job assignment conversations
-- Migration 009
--
-- Additive. Does not modify 001–008 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY until the production client can
-- safely load system messages with sender_id NULL
-- and render job conversations.
--
-- Why:
-- hire_job_applicant currently assigns the job and
-- application statuses, but never creates a
-- conversation, members, or intro message.
-- job_applications.conversation_id exists (005) and
-- stays null. Clients must not assemble that
-- lifecycle as hire + maybe-insert conversation.
--
-- This migration:
-- 1. Allows unattributed system messages (sender_id
--    null only when message_type = 'system').
-- 2. Stops authenticated clients from creating or
--    rewriting context_type = 'job' conversations,
--    and from inserting system messages.
-- 3. Enforces one conversation per job.
-- 4. Replaces hire_job_applicant so assignment and
--    conversation creation are one transaction.
-- 5. Backfills already-assigned jobs that have no
--    conversation yet.
-- 6. Adds public.message_reads if missing, then
--    fail-loud verifies compatible structure.
-- ============================================================


-- ============================================================
-- SYSTEM MESSAGES
-- 001 required sender_id, so a system row could not
-- exist without pretending a user sent it.
-- ============================================================

alter table public.messages
  alter column sender_id drop not null;

alter table public.messages
  drop constraint if exists messages_system_sender_check;

alter table public.messages
  add constraint messages_system_sender_check
  check (
    (
      message_type = 'system'
      and sender_id is null
      and body is not null
      and char_length(btrim(body)) > 0
    )
    or
    (
      message_type is distinct from 'system'
      and sender_id is not null
    )
  );

drop policy if exists
  "Participants can send messages"
on public.messages;

create policy
  "Participants can send messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and message_type is distinct from 'system'
  and public.is_conversation_participant(
    conversation_id
  )
);


-- ============================================================
-- JOB CONVERSATIONS ARE RPC-ONLY
-- Authenticated users may still create market /
-- auction / support / general threads (001).
-- They must not mint or rewrite job threads.
--
-- 001 grants are not explicit, but the UPDATE policy
-- "Participants can update conversations" has no
-- column restriction. A participant can INSERT a
-- non-job conversation then UPDATE context_type to
-- 'job' or change a job context_id. Block that here.
-- ============================================================

drop policy if exists
  "Authenticated users can create conversations"
on public.conversations;

create policy
  "Authenticated users can create conversations"
on public.conversations
for insert
to authenticated
with check (
  created_by = auth.uid()
  and context_type is distinct from 'job'
);

create or replace function public.conversations_protect_job_context()
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
    new.context_type is distinct from old.context_type
    or new.context_id is distinct from old.context_id
  then
    if
      old.context_type = 'job'
      or new.context_type = 'job'
    then
      raise exception
        'Job conversation context can only change through Direct Gain RPCs.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists
  conversations_protect_job_context
on public.conversations;

create trigger
  conversations_protect_job_context
before update
on public.conversations
for each row
execute function public.conversations_protect_job_context();

revoke all on function public.conversations_protect_job_context() from public;
revoke all on function public.conversations_protect_job_context() from anon;
revoke all on function public.conversations_protect_job_context() from authenticated;

create unique index if not exists
  conversations_unique_job_context_idx
on public.conversations (context_id)
where
  context_type = 'job'
  and context_id is not null;


-- ============================================================
-- APPLICATION CONVERSATION LINK
-- Clients have no UPDATE grant on job_applications
-- (005). Still protect conversation_id if grants change.
-- ============================================================

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
    or new.conversation_id
      is distinct from old.conversation_id
  then
    raise exception
      'Application lifecycle fields can only change through Direct Gain RPCs.';
  end if;

  return new;
end;
$$;


-- ============================================================
-- MESSAGE READS
-- Client unread already uses public.message_reads.
-- 001 only has conversation_participants.last_read_at,
-- which the app does not write. Create the table the
-- client expects if it is not already present, then
-- verify compatible structure. Do not reshape an
-- unknown existing table.
-- ============================================================

create table if not exists public.message_reads (
  conversation_id uuid
    not null
    references public.conversations(id)
    on delete cascade,

  user_id uuid
    not null
    references auth.users(id)
    on delete cascade,

  last_read_at timestamptz
    not null,

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  primary key (
    conversation_id,
    user_id
  )
);

do $$
declare
  required_column text;
  column_udt text;
  column_nullable text;
  unique_ok boolean;
begin
  if to_regclass('public.message_reads') is null then
    raise exception
      'public.message_reads was not created.';
  end if;

  foreach required_column in array array[
    'conversation_id',
    'user_id',
    'last_read_at',
    'created_at',
    'updated_at'
  ]
  loop
    select
      columns.udt_name,
      columns.is_nullable
    into
      column_udt,
      column_nullable
    from information_schema.columns as columns
    where columns.table_schema = 'public'
      and columns.table_name = 'message_reads'
      and columns.column_name = required_column;

    if column_udt is null then
      raise exception
        'public.message_reads is incompatible: missing column %.',
        required_column;
    end if;

    if column_nullable is distinct from 'NO' then
      raise exception
        'public.message_reads is incompatible: column % must be NOT NULL.',
        required_column;
    end if;

    if required_column in ('conversation_id', 'user_id') then
      if column_udt is distinct from 'uuid' then
        raise exception
          'public.message_reads is incompatible: column % must be uuid.',
          required_column;
      end if;
    else
      if column_udt is distinct from 'timestamptz' then
        raise exception
          'public.message_reads is incompatible: column % must be timestamptz.',
          required_column;
      end if;
    end if;
  end loop;

  select exists (
    select 1
    from pg_index as indexes
    join pg_class as tables
      on tables.oid = indexes.indrelid
    join pg_namespace as namespaces
      on namespaces.oid = tables.relnamespace
    where namespaces.nspname = 'public'
      and tables.relname = 'message_reads'
      and indexes.indisunique
      and (
        select coalesce(
          array_agg(attributes.attname order by ordinals.ordinality),
          '{}'::name[]
        )
        from unnest(indexes.indkey)
          with ordinality as ordinals(attnum, ordinality)
        join pg_attribute as attributes
          on attributes.attrelid = tables.oid
         and attributes.attnum = ordinals.attnum
        where ordinals.ordinality <= indexes.indnkeyatts
          and not attributes.attisdropped
      ) @> array['conversation_id', 'user_id']::name[]
      and (
        select count(*)
        from unnest(indexes.indkey)
          with ordinality as ordinals(attnum, ordinality)
        where ordinals.ordinality <= indexes.indnkeyatts
      ) = 2
  )
  into unique_ok;

  if not unique_ok then
    raise exception
      'public.message_reads is incompatible: unique (conversation_id, user_id) is required.';
  end if;
end;
$$;

create index if not exists
  message_reads_user_id_idx
on public.message_reads(user_id);

alter table public.message_reads
enable row level security;

revoke all
on table public.message_reads
from public;

revoke all
on table public.message_reads
from anon;

revoke all
on table public.message_reads
from authenticated;

grant select, insert, update (
  last_read_at,
  updated_at
)
on table public.message_reads
to authenticated;

drop trigger if exists
  message_reads_set_updated_at
on public.message_reads;

create trigger
  message_reads_set_updated_at
before update
on public.message_reads
for each row
execute function public.set_updated_at();

drop policy if exists
  "Participants can read conversation read state"
on public.message_reads;

create policy
  "Participants can read conversation read state"
on public.message_reads
for select
to authenticated
using (
  public.is_conversation_participant(
    conversation_id
  )
);

drop policy if exists
  "Users can insert their own read state"
on public.message_reads;

create policy
  "Users can insert their own read state"
on public.message_reads
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_conversation_participant(
    conversation_id
  )
);

drop policy if exists
  "Users can update their own read state"
on public.message_reads;

create policy
  "Users can update their own read state"
on public.message_reads
for update
to authenticated
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
  and public.is_conversation_participant(
    conversation_id
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'message_reads'
  ) then
    alter publication supabase_realtime
      add table public.message_reads;
  end if;
end;
$$;


-- ============================================================
-- ENSURE JOB CONVERSATION
-- Not executable by authenticated clients.
-- ============================================================

create or replace function public.ensure_job_assignment_conversation(
  p_job_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_job public.jobs%rowtype;
  locked_application public.job_applications%rowtype;
  conversation_uuid uuid;
  intro_body text;
  job_context_id text;
begin
  if p_job_id is null then
    raise exception
      'A job is required to open this conversation.';
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

  if locked_job.status is distinct from 'assigned' then
    raise exception
      'A job conversation can only be created for assigned work.';
  end if;

  if
    locked_job.selected_application_id is null
    or locked_job.assigned_user_id is null
  then
    raise exception
      'This job does not have an assigned worker.';
  end if;

  select *
  into locked_application
  from public.job_applications
  where id = locked_job.selected_application_id
  for update;

  if not found then
    raise exception
      'The selected application does not exist.';
  end if;

  if locked_application.job_id is distinct from locked_job.id then
    raise exception
      'The selected application does not belong to this job.';
  end if;

  if locked_application.status is distinct from 'selected' then
    raise exception
      'A job conversation can only be created for a selected application.';
  end if;

  if locked_application.applicant_id is distinct from locked_job.assigned_user_id then
    raise exception
      'The assigned worker does not match the selected application.';
  end if;

  if locked_application.applicant_id = locked_job.poster_id then
    raise exception
      'A poster cannot have a job conversation with themselves.';
  end if;

  job_context_id := locked_job.id::text;

  select conversations.id
  into conversation_uuid
  from public.conversations as conversations
  where conversations.context_type = 'job'
    and conversations.context_id = job_context_id
  for update;

  if conversation_uuid is null then
    insert into public.conversations (
      context_type,
      context_id,
      title,
      created_by
    )
    values (
      'job',
      job_context_id,
      locked_job.title,
      locked_job.poster_id
    )
    returning id into conversation_uuid;
  end if;

  insert into public.conversation_participants (
    conversation_id,
    user_id,
    role,
    last_read_at
  )
  values (
    conversation_uuid,
    locked_job.poster_id,
    'employer',
    now()
  )
  on conflict (conversation_id, user_id)
  do nothing;

  insert into public.conversation_participants (
    conversation_id,
    user_id,
    role,
    last_read_at
  )
  values (
    conversation_uuid,
    locked_application.applicant_id,
    'worker',
    null
  )
  on conflict (conversation_id, user_id)
  do nothing;

  if not exists (
    select 1
    from public.messages
    where conversation_id = conversation_uuid
      and message_type = 'system'
      and deleted_at is null
      and metadata->>'kind' = 'job_connected'
  ) then
    intro_body :=
      'You''ve been connected for '
      || locked_job.title
      || '. Use this chat to organise the job details.';

    insert into public.messages (
      conversation_id,
      sender_id,
      message_type,
      body,
      metadata
    )
    values (
      conversation_uuid,
      null,
      'system',
      intro_body,
      jsonb_build_object(
        'kind', 'job_connected',
        'job_id', locked_job.id
      )
    );
  end if;

  insert into public.message_reads (
    conversation_id,
    user_id,
    last_read_at
  )
  values (
    conversation_uuid,
    locked_job.poster_id,
    now()
  )
  on conflict (conversation_id, user_id)
  do nothing;

  if
    locked_application.conversation_id is distinct from conversation_uuid
  then
    update public.job_applications
    set conversation_id = conversation_uuid
    where id = locked_application.id;
  end if;

  return conversation_uuid;
end;
$$;


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

  perform public.ensure_job_assignment_conversation(
    locked_job.id
  );

  return locked_job.id;
end;
$$;


-- Existing assigned jobs (including already-hired QA work)
-- get the same conversation once, idempotently.
do $$
declare
  assigned_job_id uuid;
begin
  for assigned_job_id in
    select jobs.id
    from public.jobs as jobs
    join public.job_applications as applications
      on applications.id = jobs.selected_application_id
    where jobs.status = 'assigned'
      and jobs.assigned_user_id is not null
      and applications.conversation_id is null
  loop
    perform public.ensure_job_assignment_conversation(
      assigned_job_id
    );
  end loop;
end;
$$;


revoke all on function public.ensure_job_assignment_conversation(uuid) from public;
revoke all on function public.ensure_job_assignment_conversation(uuid) from anon;
revoke all on function public.ensure_job_assignment_conversation(uuid) from authenticated;

revoke all on function public.hire_job_applicant(uuid, uuid) from public;
revoke all on function public.hire_job_applicant(uuid, uuid) from anon;
grant execute on function public.hire_job_applicant(uuid, uuid) to authenticated;
