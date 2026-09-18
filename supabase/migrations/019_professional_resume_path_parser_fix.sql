-- ============================================================
-- DIRECT GAIN
-- Professional résumé path parser fix
-- Migration 019
--
-- Additive. Does not modify 001–018 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Migrations 017 and 018 remain immutable.
--
-- Observed runtime:
-- Authenticated résumé upload to professional-resumes
-- failed with StorageApiError 403
--   new row violates row-level security policy
-- Client path was canonical:
--   {auth.uid()}/{object_uuid}.pdf
-- Migration 018 SELECT (no metadata EXISTS) was already
-- live. INSERT still uses
--   professional_resume_path_profile_id(name) = auth.uid()
-- so a NULL parser result fails WITH CHECK.
--
-- Proven helper mismatch (synthetic canonical path):
--   11111111-1111-4111-8111-111111111111/
--   22222222-2222-4222-8222-222222222222.pdf
-- is_professional_resume_storage_path(path, expected_uuid)
--   → true
-- professional_resume_path_profile_id(path)
--   → NULL
--
-- Defect:
-- 017 defined the validator as language sql and the
-- parser as language plpgsql. The parser duplicated the
-- canonical-path regex in a PL/pgSQL string and returned
-- NULL when that pre-check failed, without ever reaching
-- the validator that accepts the same path. Storage RLS
-- therefore saw a NULL owner id.
--
-- This migration:
-- CREATE OR REPLACE only
--   public.professional_resume_path_profile_id(text)
-- as language sql, same signature. It regex-guards in the
-- same SQL string context as the working validator, then
-- defers to is_professional_resume_storage_path, then
-- returns the first UUID. Invalid paths still return NULL.
--
-- Security-equivalent except valid canonical owner paths
-- now parse. Grants remain authenticated EXECUTE only.
-- Does NOT:
-- - change Storage INSERT/SELECT/DELETE policies
-- - add Storage UPDATE
-- - change the private bucket, MIME, or 5 MiB limit
-- - change professional_resumes, RPCs, or client code
-- - write profile_presentation.active_template
-- - make Professional public
-- ============================================================


create or replace function public.professional_resume_path_profile_id(
  object_path text
)
returns uuid
language sql
immutable
set search_path = public, pg_temp
as $$
  select
    case
      when object_path is not null
        and object_path ~
          '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$'
        and public.is_professional_resume_storage_path(
          object_path,
          split_part(object_path, '/', 1)::uuid
        )
      then
        split_part(object_path, '/', 1)::uuid
      else
        null
    end;
$$;


revoke all
on function public.professional_resume_path_profile_id(text)
from public;

revoke all
on function public.professional_resume_path_profile_id(text)
from anon;

grant execute
on function public.professional_resume_path_profile_id(text)
to authenticated;
