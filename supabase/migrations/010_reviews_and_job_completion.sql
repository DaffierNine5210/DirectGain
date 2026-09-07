-- ============================================================
-- DIRECT GAIN
-- Reviews + trustworthy job completion
-- Migration 010
--
-- Additive. Does not modify 001–009 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- This migration:
-- 1. Requires BOTH poster and assigned worker to
--    confirm before a job becomes completed.
-- 2. Replaces poster-only complete_job so it cannot
--    unilaterally create a reputation-qualified
--    completion. Signature stays complete_job(uuid)
--    returns uuid. Authorization stays poster-only;
--    the worker must call confirm_job_completion.
-- 3. Mints exactly two job review eligibilities
--    when the second confirmation completes the job
--    (poster→worker and worker→poster).
-- 4. Adds reviews consumed only through
--    submit_review / edit_review RPCs.
-- 5. Does NOT mint Market or Auction eligibility.
-- 6. Does NOT add Gain Score or verification.
-- 7. Does NOT expose job title, pay, location,
--    messages, or subject UUIDs on public review
--    reads.
-- ============================================================


-- ============================================================
-- TABLE: job_completion_confirmations
-- ============================================================

create table if not exists
  public.job_completion_confirmations (
  id uuid
    primary key
    default gen_random_uuid(),

  job_id uuid
    not null
    references public.jobs(id)
    on delete cascade,

  confirmer_id uuid
    not null
    references public.profiles(id)
    on delete restrict,

  confirmed_at timestamptz
    not null
    default now(),

  constraint job_completion_confirmations_job_confirmer_key
    unique (job_id, confirmer_id)
);

create index if not exists
  job_completion_confirmations_job_id_idx
on public.job_completion_confirmations(job_id);


-- ============================================================
-- TABLE: review_eligibilities
-- subject_type allows future market/auction rows.
-- Authenticated clients cannot INSERT those types.
-- Only confirm_job_completion mints subject_type = job.
-- ============================================================

create table if not exists
  public.review_eligibilities (
  id uuid
    primary key
    default gen_random_uuid(),

  subject_type text
    not null
    check (
      subject_type in (
        'job',
        'market',
        'auction'
      )
    ),

  subject_id uuid
    not null,

  reviewer_id uuid
    not null
    references public.profiles(id)
    on delete restrict,

  reviewee_id uuid
    not null
    references public.profiles(id)
    on delete restrict,

  created_at timestamptz
    not null
    default now(),

  -- Consumed pointer only. No FK to reviews: a
  -- bidirectional FK with reviews.eligibility_id
  -- would complicate insert/delete ordering.
  -- One review per eligibility is enforced by
  -- reviews.eligibility_id UNIQUE. review_id is
  -- set once by submit_review and indexed for
  -- open-eligibility lookups.
  review_id uuid
    unique,

  constraint review_eligibilities_not_self_check
    check (
      reviewer_id <> reviewee_id
    ),

  constraint review_eligibilities_subject_reviewer_key
    unique (
      subject_type,
      subject_id,
      reviewer_id
    )
);

create index if not exists
  review_eligibilities_open_reviewer_idx
on public.review_eligibilities(reviewer_id)
where review_id is null;


-- ============================================================
-- TABLE: reviews
-- ============================================================

create table if not exists
  public.reviews (
  id uuid
    primary key
    default gen_random_uuid(),

  eligibility_id uuid
    not null
    unique
    references public.review_eligibilities(id)
    on delete restrict,

  reviewer_id uuid
    not null
    references public.profiles(id)
    on delete restrict,

  reviewee_id uuid
    not null
    references public.profiles(id)
    on delete restrict,

  subject_type text
    not null
    check (
      subject_type in (
        'job',
        'market',
        'auction'
      )
    ),

  subject_id uuid
    not null,

  rating integer
    not null
    check (
      rating between 1 and 5
    ),

  body text,

  status text
    not null
    default 'published'
    check (
      status in (
        'published',
        'hidden',
        'removed'
      )
    ),

  created_at timestamptz
    not null
    default now(),

  updated_at timestamptz
    not null
    default now(),

  edited_at timestamptz,

  constraint reviews_not_self_check
    check (
      reviewer_id <> reviewee_id
    ),

  constraint reviews_body_length_check
    check (
      body is null
      or (
        char_length(body) between 10 and 500
        and body = btrim(body)
      )
    )
);

create index if not exists
  reviews_reviewee_published_created_idx
on public.reviews(reviewee_id, created_at desc)
where status = 'published';


drop trigger if exists
  reviews_set_updated_at
on public.reviews;

create trigger
  reviews_set_updated_at
before update
on public.reviews
for each row
execute function public.set_updated_at();


-- ============================================================
-- RLS
-- ============================================================

alter table public.job_completion_confirmations
  enable row level security;

alter table public.review_eligibilities
  enable row level security;

alter table public.reviews
  enable row level security;


-- ============================================================
-- HELPERS
-- Not executable by authenticated clients except
-- the read helper used by RLS (same pattern as
-- is_job_poster).
-- ============================================================

create or replace function public.normalize_review_body(
  p_body text
)
returns text
language plpgsql
immutable
set search_path = public, pg_temp
as $$
declare
  trimmed text;
begin
  trimmed :=
    nullif(
      btrim(coalesce(p_body, '')),
      ''
    );

  if trimmed is null then
    return null;
  end if;

  if char_length(trimmed) < 10
    or char_length(trimmed) > 500
  then
    raise exception
      'Keep your review between 10 and 500 characters, or leave it empty.';
  end if;

  return trimmed;
end;
$$;


create or replace function public.is_job_completion_party(
  p_job_id uuid
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
    where jobs.id = p_job_id
      and (
        jobs.poster_id = auth.uid()
        or jobs.assigned_user_id = auth.uid()
      )
  );
$$;


create or replace function public.mint_job_review_eligibilities(
  p_job_id uuid,
  p_poster_id uuid,
  p_worker_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_job_id is null
    or p_poster_id is null
    or p_worker_id is null
  then
    raise exception
      'Job review eligibility could not be created.';
  end if;

  if p_poster_id = p_worker_id then
    raise exception
      'A job cannot create a review between the same person.';
  end if;

  insert into public.review_eligibilities (
    subject_type,
    subject_id,
    reviewer_id,
    reviewee_id
  )
  values
    (
      'job',
      p_job_id,
      p_poster_id,
      p_worker_id
    ),
    (
      'job',
      p_job_id,
      p_worker_id,
      p_poster_id
    )
  on conflict
    on constraint review_eligibilities_subject_reviewer_key
  do nothing;
end;
$$;


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
  from public.jobs
  where id = p_job_id
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
    from public.job_completion_confirmations
    where job_id = locked_job.id
      and confirmer_id = locked_job.poster_id
  );

  worker_has_confirmed := exists (
    select 1
    from public.job_completion_confirmations
    where job_id = locked_job.id
      and confirmer_id = locked_job.assigned_user_id
  );

  if poster_has_confirmed and worker_has_confirmed then
    if locked_job.status = 'assigned' then
      update public.jobs
      set
        status = 'completed',
        completed_at = now()
      where id = locked_job.id;

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


-- ============================================================
-- IDENTITY / LIFECYCLE TRIGGERS
-- Definer RPCs run as the function owner, so
-- authenticated/anon still cannot mutate protected
-- columns through table grants (there are none).
-- ============================================================

create or replace function public.reviews_protect_identity()
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
    if
      new.id is distinct from old.id
      or new.eligibility_id
        is distinct from old.eligibility_id
      or new.reviewer_id
        is distinct from old.reviewer_id
      or new.reviewee_id
        is distinct from old.reviewee_id
      or new.subject_type
        is distinct from old.subject_type
      or new.subject_id
        is distinct from old.subject_id
      or new.created_at
        is distinct from old.created_at
    then
      raise exception
        'Review identity cannot be changed.';
    end if;

    return new;
  end if;

  raise exception
    'Reviews can only change through Direct Gain RPCs.';
end;
$$;


create or replace function public.review_eligibilities_protect_lifecycle()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    if
      current_user
        in (
          'authenticated',
          'anon'
        )
    then
      raise exception
        'Review eligibility can only be created through Direct Gain RPCs.';
    end if;

    if new.review_id is not null then
      raise exception
        'Review eligibility cannot start already consumed.';
    end if;

    return new;
  end if;

  if
    current_user
      not in (
        'authenticated',
        'anon'
      )
  then
    if
      new.id is distinct from old.id
      or new.subject_type
        is distinct from old.subject_type
      or new.subject_id
        is distinct from old.subject_id
      or new.reviewer_id
        is distinct from old.reviewer_id
      or new.reviewee_id
        is distinct from old.reviewee_id
      or new.created_at
        is distinct from old.created_at
    then
      raise exception
        'Review eligibility identity cannot be changed.';
    end if;

    if old.review_id is not null
      and new.review_id is distinct from old.review_id
    then
      raise exception
        'A used review eligibility cannot be reassigned.';
    end if;

    if old.review_id is null
      and new.review_id is not null
    then
      if not exists (
        select 1
        from public.reviews as reviews
        where reviews.id = new.review_id
          and reviews.eligibility_id = new.id
          and reviews.reviewer_id = new.reviewer_id
          and reviews.reviewee_id = new.reviewee_id
          and reviews.subject_type = new.subject_type
          and reviews.subject_id = new.subject_id
      ) then
        raise exception
          'Review eligibility does not match that review.';
      end if;
    end if;

    return new;
  end if;

  raise exception
    'Review eligibility can only change through Direct Gain RPCs.';
end;
$$;


create or replace function public.reviews_match_eligibility()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  locked_eligibility public.review_eligibilities%rowtype;
begin
  select *
  into locked_eligibility
  from public.review_eligibilities
  where id = new.eligibility_id
  for share;

  if not found then
    raise exception
      'That review eligibility does not exist.';
  end if;

  if
    new.reviewer_id
      is distinct from locked_eligibility.reviewer_id
    or new.reviewee_id
      is distinct from locked_eligibility.reviewee_id
    or new.subject_type
      is distinct from locked_eligibility.subject_type
    or new.subject_id
      is distinct from locked_eligibility.subject_id
  then
    raise exception
      'A review must match its eligibility.';
  end if;

  if locked_eligibility.review_id is not null
    and locked_eligibility.review_id
      is distinct from new.id
  then
    raise exception
      'This review eligibility has already been used.';
  end if;

  return new;
end;
$$;


create or replace function public.job_completion_confirmations_protect_write()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    current_user
      in (
        'authenticated',
        'anon'
      )
  then
    raise exception
      'Job completion can only be confirmed through Direct Gain RPCs.';
  end if;

  return new;
end;
$$;


create or replace function public.reviews_forbid_client_delete()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    current_user
      in (
        'authenticated',
        'anon'
      )
  then
    raise exception
      'Reviews cannot be deleted.';
  end if;

  return old;
end;
$$;


create or replace function public.review_eligibilities_forbid_client_delete()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if
    current_user
      in (
        'authenticated',
        'anon'
      )
  then
    raise exception
      'Review eligibility cannot be deleted.';
  end if;

  return old;
end;
$$;


drop trigger if exists
  reviews_protect_identity
on public.reviews;

create trigger
  reviews_protect_identity
before update
on public.reviews
for each row
execute function public.reviews_protect_identity();


drop trigger if exists
  reviews_match_eligibility
on public.reviews;

create trigger
  reviews_match_eligibility
before insert
on public.reviews
for each row
execute function public.reviews_match_eligibility();


drop trigger if exists
  review_eligibilities_protect_lifecycle
on public.review_eligibilities;

create trigger
  review_eligibilities_protect_lifecycle
before insert or update
on public.review_eligibilities
for each row
execute function public.review_eligibilities_protect_lifecycle();


drop trigger if exists
  job_completion_confirmations_protect_write
on public.job_completion_confirmations;

create trigger
  job_completion_confirmations_protect_write
before insert or update
on public.job_completion_confirmations
for each row
execute function public.job_completion_confirmations_protect_write();


drop trigger if exists
  reviews_forbid_client_delete
on public.reviews;

create trigger
  reviews_forbid_client_delete
before delete
on public.reviews
for each row
execute function public.reviews_forbid_client_delete();


drop trigger if exists
  review_eligibilities_forbid_client_delete
on public.review_eligibilities;

create trigger
  review_eligibilities_forbid_client_delete
before delete
on public.review_eligibilities
for each row
execute function public.review_eligibilities_forbid_client_delete();


-- ============================================================
-- POLICIES
-- No INSERT/UPDATE/DELETE policies for authenticated
-- clients. Table grants are SELECT only.
-- ============================================================

drop policy if exists
  "Job parties can read completion confirmations"
on public.job_completion_confirmations;

create policy
  "Job parties can read completion confirmations"
on public.job_completion_confirmations
for select
to authenticated
using (
  public.is_job_completion_party(job_id)
);


drop policy if exists
  "Reviewers can read their own eligibility"
on public.review_eligibilities;

create policy
  "Reviewers can read their own eligibility"
on public.review_eligibilities
for select
to authenticated
using (
  reviewer_id = auth.uid()
);


drop policy if exists
  "Authenticated users can read published reviews"
on public.reviews;

create policy
  "Authenticated users can read published reviews"
on public.reviews
for select
to authenticated
using (
  status = 'published'
);


-- ============================================================
-- PUBLIC RPCs
-- ============================================================

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
  select *
  from public.apply_job_completion_confirmation(
    p_job_id
  );
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
  job_poster uuid;
  confirmation_state record;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to complete a job.';
  end if;

  if p_job_id is null then
    raise exception
      'A job is required to complete.';
  end if;

  select poster_id
  into job_poster
  from public.jobs
  where id = p_job_id;

  if not found then
    raise exception
      'That job does not exist.';
  end if;

  if job_poster is distinct from current_user_id then
    raise exception
      'Only the job poster can mark work completed.';
  end if;

  select *
  into confirmation_state
  from public.apply_job_completion_confirmation(
    p_job_id
  );

  return confirmation_state.job_id;
end;
$$;


create or replace function public.submit_review(
  p_eligibility_id uuid,
  p_rating integer,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked_eligibility public.review_eligibilities%rowtype;
  normalized_body text;
  new_review_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to leave a review.';
  end if;

  if p_eligibility_id is null then
    raise exception
      'A review eligibility is required.';
  end if;

  if p_rating is null
    or p_rating < 1
    or p_rating > 5
  then
    raise exception
      'Choose a rating from 1 to 5.';
  end if;

  normalized_body :=
    public.normalize_review_body(p_body);

  select *
  into locked_eligibility
  from public.review_eligibilities
  where id = p_eligibility_id
  for update;

  if not found then
    raise exception
      'That review eligibility does not exist.';
  end if;

  if locked_eligibility.reviewer_id
    is distinct from current_user_id
  then
    raise exception
      'You can only leave this review if it belongs to you.';
  end if;

  if locked_eligibility.review_id is not null then
    return locked_eligibility.review_id;
  end if;

  begin
    insert into public.reviews (
      eligibility_id,
      reviewer_id,
      reviewee_id,
      subject_type,
      subject_id,
      rating,
      body,
      status
    )
    values (
      locked_eligibility.id,
      locked_eligibility.reviewer_id,
      locked_eligibility.reviewee_id,
      locked_eligibility.subject_type,
      locked_eligibility.subject_id,
      p_rating,
      normalized_body,
      'published'
    )
    returning id
    into new_review_id;
  exception
    when unique_violation then
      select reviews.id
      into new_review_id
      from public.reviews as reviews
      where reviews.eligibility_id =
        locked_eligibility.id;

      if new_review_id is null then
        raise exception
          'Your review could not be saved. Try again.';
      end if;
  end;

  update public.review_eligibilities
  set review_id = new_review_id
  where id = locked_eligibility.id
    and review_id is null;

  if not found then
    select review_id
    into new_review_id
    from public.review_eligibilities
    where id = locked_eligibility.id;

    if new_review_id is null then
      raise exception
        'Your review could not be saved. Try again.';
    end if;
  end if;

  return new_review_id;
end;
$$;


create or replace function public.edit_review(
  p_review_id uuid,
  p_rating integer,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid;
  locked_review public.reviews%rowtype;
  normalized_body text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'You must be signed in to edit a review.';
  end if;

  if p_review_id is null then
    raise exception
      'A review is required.';
  end if;

  if p_rating is null
    or p_rating < 1
    or p_rating > 5
  then
    raise exception
      'Choose a rating from 1 to 5.';
  end if;

  normalized_body :=
    public.normalize_review_body(p_body);

  select *
  into locked_review
  from public.reviews
  where id = p_review_id
  for update;

  if not found then
    raise exception
      'That review does not exist.';
  end if;

  if locked_review.reviewer_id
    is distinct from current_user_id
  then
    raise exception
      'You can only edit your own review.';
  end if;

  if locked_review.status is distinct from 'published' then
    raise exception
      'That review can no longer be edited.';
  end if;

  if now() >= locked_review.created_at
    + interval '72 hours'
  then
    raise exception
      'Reviews can only be edited within 72 hours.';
  end if;

  update public.reviews
  set
    rating = p_rating,
    body = normalized_body,
    edited_at = now()
  where id = locked_review.id;

  return locked_review.id;
end;
$$;


create or replace function public.get_profile_reviews(
  p_reviewee_id uuid
)
returns table (
  id uuid,
  reviewer_id uuid,
  rating integer,
  body text,
  subject_type text,
  created_at timestamptz,
  edited_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception
      'You must be signed in to view reviews.';
  end if;

  if p_reviewee_id is null then
    raise exception
      'A profile is required.';
  end if;

  return query
  select
    reviews.id,
    reviews.reviewer_id,
    reviews.rating,
    reviews.body,
    reviews.subject_type,
    reviews.created_at,
    reviews.edited_at
  from public.reviews as reviews
  where reviews.reviewee_id = p_reviewee_id
    and reviews.status = 'published'
  order by reviews.created_at desc;
end;
$$;


create or replace function public.get_profile_review_stats(
  p_reviewee_id uuid
)
returns table (
  review_count integer,
  average_rating numeric
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception
      'You must be signed in to view review stats.';
  end if;

  if p_reviewee_id is null then
    raise exception
      'A profile is required.';
  end if;

  return query
  select
    count(*)::integer as review_count,
    case
      when count(*) = 0 then
        null::numeric
      else
        round(avg(reviews.rating)::numeric, 2)
    end as average_rating
  from public.reviews as reviews
  where reviews.reviewee_id = p_reviewee_id
    and reviews.status = 'published';
end;
$$;


-- ============================================================
-- TABLE PRIVILEGES
-- ============================================================

revoke all
on table public.job_completion_confirmations
from public;

revoke all
on table public.job_completion_confirmations
from anon;

revoke all
on table public.job_completion_confirmations
from authenticated;

grant select
on table public.job_completion_confirmations
to authenticated;


revoke all
on table public.review_eligibilities
from public;

revoke all
on table public.review_eligibilities
from anon;

revoke all
on table public.review_eligibilities
from authenticated;

grant select
on table public.review_eligibilities
to authenticated;


revoke all
on table public.reviews
from public;

revoke all
on table public.reviews
from anon;

revoke all
on table public.reviews
from authenticated;


-- ============================================================
-- FUNCTION PRIVILEGES
-- ============================================================

revoke all on function public.normalize_review_body(text)
  from public;
revoke all on function public.normalize_review_body(text)
  from anon;
revoke all on function public.normalize_review_body(text)
  from authenticated;

revoke all on function public.is_job_completion_party(uuid)
  from public;
revoke all on function public.is_job_completion_party(uuid)
  from anon;
grant execute on function public.is_job_completion_party(uuid)
  to authenticated;

revoke all on function public.mint_job_review_eligibilities(uuid, uuid, uuid)
  from public;
revoke all on function public.mint_job_review_eligibilities(uuid, uuid, uuid)
  from anon;
revoke all on function public.mint_job_review_eligibilities(uuid, uuid, uuid)
  from authenticated;

revoke all on function public.apply_job_completion_confirmation(uuid)
  from public;
revoke all on function public.apply_job_completion_confirmation(uuid)
  from anon;
revoke all on function public.apply_job_completion_confirmation(uuid)
  from authenticated;

revoke all on function public.reviews_protect_identity()
  from public;
revoke all on function public.reviews_protect_identity()
  from anon;
revoke all on function public.reviews_protect_identity()
  from authenticated;

revoke all on function public.review_eligibilities_protect_lifecycle()
  from public;
revoke all on function public.review_eligibilities_protect_lifecycle()
  from anon;
revoke all on function public.review_eligibilities_protect_lifecycle()
  from authenticated;

revoke all on function public.reviews_match_eligibility()
  from public;
revoke all on function public.reviews_match_eligibility()
  from anon;
revoke all on function public.reviews_match_eligibility()
  from authenticated;

revoke all on function public.job_completion_confirmations_protect_write()
  from public;
revoke all on function public.job_completion_confirmations_protect_write()
  from anon;
revoke all on function public.job_completion_confirmations_protect_write()
  from authenticated;

revoke all on function public.reviews_forbid_client_delete()
  from public;
revoke all on function public.reviews_forbid_client_delete()
  from anon;
revoke all on function public.reviews_forbid_client_delete()
  from authenticated;

revoke all on function public.review_eligibilities_forbid_client_delete()
  from public;
revoke all on function public.review_eligibilities_forbid_client_delete()
  from anon;
revoke all on function public.review_eligibilities_forbid_client_delete()
  from authenticated;

revoke all on function public.confirm_job_completion(uuid)
  from public;
revoke all on function public.confirm_job_completion(uuid)
  from anon;
grant execute on function public.confirm_job_completion(uuid)
  to authenticated;

revoke all on function public.complete_job(uuid)
  from public;
revoke all on function public.complete_job(uuid)
  from anon;
grant execute on function public.complete_job(uuid)
  to authenticated;

revoke all on function public.submit_review(uuid, integer, text)
  from public;
revoke all on function public.submit_review(uuid, integer, text)
  from anon;
grant execute on function public.submit_review(uuid, integer, text)
  to authenticated;

revoke all on function public.edit_review(uuid, integer, text)
  from public;
revoke all on function public.edit_review(uuid, integer, text)
  from anon;
grant execute on function public.edit_review(uuid, integer, text)
  to authenticated;

revoke all on function public.get_profile_reviews(uuid)
  from public;
revoke all on function public.get_profile_reviews(uuid)
  from anon;
grant execute on function public.get_profile_reviews(uuid)
  to authenticated;

revoke all on function public.get_profile_review_stats(uuid)
  from public;
revoke all on function public.get_profile_review_stats(uuid)
  from anon;
grant execute on function public.get_profile_review_stats(uuid)
  to authenticated;
