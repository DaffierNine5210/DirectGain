-- ============================================================
-- DIRECT GAIN
-- Fix ambiguous job_id in job completion
-- Migration 011
--
-- Additive. Does not modify 001–010 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Why:
-- confirm_job_completion failed at runtime with
--   42702 column reference "job_id" is ambiguous
--   It could refer to either a PL/pgSQL variable
--   or a table column.
--
-- apply_job_completion_confirmation RETURNS TABLE
-- (job_id, ...), so job_id is a PL/pgSQL output
-- variable. Unqualified
--   where job_id = locked_job.id
-- against job_completion_confirmations collides
-- with that variable.
--
-- This migration:
-- 1. Replaces apply_job_completion_confirmation
--    so SQL column references are table-qualified.
-- 2. Replaces confirm_job_completion so RETURN
--    QUERY does not SELECT * into the same output
--    names.
-- 3. Does not change dual-confirm semantics,
--    complete_job poster-only auth, review minting,
--    tables, RLS, or client grants.
-- ============================================================


create or replace function public.apply_job_completion_confirmation(
  p_job_id uuid
)
returns table (
  job_id uuid,
  job_status text,
  poster_confirmed boolean,
  worker_confirmed boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked_job public.jobs%rowtype;
  poster_has_confirmed boolean;
  worker_has_confirmed boolean;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to confirm job completion.';
  end if;

  if p_job_id is null then
    raise exception
      'A job is required to confirm completion.';
  end if;

  select *
  into locked_job
  from public.jobs as jobs
  where jobs.id = p_job_id
  for update;

  if not found then
    raise exception
      'That job does not exist.';
  end if;

  if locked_job.assigned_user_id is null
    or locked_job.poster_id is null
  then
    raise exception
      'This job does not have an assigned worker.';
  end if;

  if locked_job.poster_id = locked_job.assigned_user_id then
    raise exception
      'A job cannot be confirmed between the same person.';
  end if;

  if
    current_user_id is distinct from locked_job.poster_id
    and current_user_id
      is distinct from locked_job.assigned_user_id
  then
    raise exception
      'Only the job poster or the assigned worker can confirm completion.';
  end if;

  if locked_job.status = 'cancelled' then
    raise exception
      'A cancelled job cannot be confirmed complete.';
  end if;

  if locked_job.status = 'open' then
    raise exception
      'Only assigned work can be confirmed complete.';
  end if;

  if locked_job.status not in ('assigned', 'completed') then
    raise exception
      'This job cannot be confirmed complete.';
  end if;

  insert into public.job_completion_confirmations (
    job_id,
    confirmer_id
  )
  values (
    locked_job.id,
    current_user_id
  )
  on conflict
    on constraint job_completion_confirmations_job_confirmer_key
  do nothing;

  poster_has_confirmed := exists (
    select 1
    from public.job_completion_confirmations as confirmations
    where confirmations.job_id = locked_job.id
      and confirmations.confirmer_id = locked_job.poster_id
  );

  worker_has_confirmed := exists (
    select 1
    from public.job_completion_confirmations as confirmations
    where confirmations.job_id = locked_job.id
      and confirmations.confirmer_id = locked_job.assigned_user_id
  );

  if poster_has_confirmed and worker_has_confirmed then
    if locked_job.status = 'assigned' then
      update public.jobs as jobs
      set
        status = 'completed',
        completed_at = now()
      where jobs.id = locked_job.id;

      locked_job.status := 'completed';
    end if;

    perform public.mint_job_review_eligibilities(
      locked_job.id,
      locked_job.poster_id,
      locked_job.assigned_user_id
    );
  end if;

  job_id := locked_job.id;
  job_status :=
    case
      when poster_has_confirmed
        and worker_has_confirmed
      then 'completed'
      else locked_job.status
    end;
  poster_confirmed := poster_has_confirmed;
  worker_confirmed := worker_has_confirmed;
  return next;
end;
$$;


create or replace function public.confirm_job_completion(
  p_job_id uuid
)
returns table (
  job_id uuid,
  job_status text,
  poster_confirmed boolean,
  worker_confirmed boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  return query
  select
    confirmation.job_id,
    confirmation.job_status,
    confirmation.poster_confirmed,
    confirmation.worker_confirmed
  from public.apply_job_completion_confirmation(
    p_job_id
  ) as confirmation;
end;
$$;


revoke all on function public.apply_job_completion_confirmation(uuid)
  from public;
revoke all on function public.apply_job_completion_confirmation(uuid)
  from anon;
revoke all on function public.apply_job_completion_confirmation(uuid)
  from authenticated;

revoke all on function public.confirm_job_completion(uuid)
  from public;
revoke all on function public.confirm_job_completion(uuid)
  from anon;
grant execute on function public.confirm_job_completion(uuid)
  to authenticated;
