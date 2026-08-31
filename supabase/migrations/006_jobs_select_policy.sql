-- ============================================================
-- DIRECT GAIN
-- Jobs SELECT policy: evaluate visibility on the
-- new/current row, do not re-query jobs.
-- Migration 006
--
-- Local file only until approved.
-- Do not apply remotely without explicit approval.
--
-- Hosted 004 and 005 are already applied and
-- must not be rewritten.
--
-- Why:
-- PostgREST insert().select() uses INSERT
-- RETURNING. PostgreSQL then applies SELECT
-- RLS to the new row. 005's SELECT policy
-- called can_read_job(id), which SELECTs from
-- public.jobs again. That nested lookup does
-- not see the in-flight INSERT row, so EXISTS
-- is false and Postgres raises:
--   42501 new row violates row-level security
--   policy for table "jobs"
-- even when INSERT WITH CHECK would pass.
--
-- This policy keeps the same visibility rules
-- (open/assigned/completed, poster, assigned
-- worker, or existing applicant) but applies
-- them to the row being read/returned.
-- ============================================================

drop policy if exists
  "Authenticated users can read visible jobs"
on public.jobs;

create policy
  "Authenticated users can read visible jobs"
on public.jobs
for select
to authenticated
using (
  status in (
    'open',
    'assigned',
    'completed'
  )
  or poster_id = auth.uid()
  or assigned_user_id = auth.uid()
  or exists (
    select 1
    from public.job_applications as applications
    where applications.job_id = jobs.id
      and applications.applicant_id = auth.uid()
  )
);
