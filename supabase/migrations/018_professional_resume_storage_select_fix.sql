-- ============================================================
-- DIRECT GAIN
-- Professional résumé Storage SELECT fix
-- Migration 018
--
-- Additive. Does not modify 001–017 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Migration 017 is already applied and remains
-- immutable. It created private bucket
-- professional-resumes and owner-only INSERT,
-- SELECT, and DELETE policies. There is still
-- no Storage UPDATE policy.
--
-- Why:
-- Résumé upload failed at runtime with
--   new row violates row-level security policy
-- The Storage API inserts with RETURNING *.
-- 017 SELECT also required an existing
-- professional_resumes metadata row. Upload
-- happens before save_own_professional_resume,
-- so the draft object could not be returned
-- and the whole upload rolled back.
--
-- This migration:
-- Replaces only
--   "Owners can read their professional-resumes objects"
-- so SELECT matches owner canonical-path
-- ownership (same bound as INSERT/DELETE).
-- The owner can SELECT
--   {auth.uid()}/{object_uuid}.pdf
-- during the short draft window before metadata
-- exists. Another authenticated user still cannot.
--
-- Does NOT:
-- - change professional_resumes table or table RLS
-- - change save/remove RPCs
-- - change INSERT or DELETE Storage policies
-- - add Storage UPDATE
-- - change the private bucket, MIME, or 5 MiB limit
-- - change path helpers, grants, or triggers
-- - write profile_presentation.active_template
-- - make Professional public
-- ============================================================


drop policy if exists
  "Owners can read their professional-resumes objects"
on storage.objects;

create policy
  "Owners can read their professional-resumes objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'professional-resumes'
  and public.is_professional_resume_storage_path(
    name,
    public.professional_resume_path_profile_id(name)
  )
  and public.professional_resume_path_profile_id(name)
    = auth.uid()
);
