-- ============================================================
-- DIRECT GAIN
-- Professional portfolio authenticated visitor read
-- Migration 021
--
-- Additive. Does not modify 001–020 files.
-- DO NOT APPLY until reviewed.
-- DO NOT APPLY to hosted until explicitly approved.
--
-- Product:
-- Authenticated Direct Gain members may READ Professional
-- portfolio projects and matching portfolio photos.
--
-- This migration does NOT:
-- - change profile_presentation.active_template
-- - activate Professional as a live style
-- - grant visitor INSERT / UPDATE / DELETE
-- - change résumé table or professional-resumes Storage
-- - make the professional-portfolio bucket public
-- - grant anonymous access
--
-- Writes remain owner RPC / owner storage INSERT+DELETE.
-- Draft portfolio uploads remain unreadable until a
-- professional_portfolio_media row exists.
-- ============================================================


-- ============================================================
-- TABLE SELECT
-- Replace owner-only SELECT with authenticated read of
-- any Professional portfolio metadata row.
-- GRANT SELECT already exists from Migration 016.
-- No INSERT / UPDATE / DELETE grants are added.
-- ============================================================

drop policy if exists
  "Owners can read their professional portfolio projects"
on public.professional_portfolio_projects;

drop policy if exists
  "Authenticated users can read professional portfolio projects"
on public.professional_portfolio_projects;

create policy
  "Authenticated users can read professional portfolio projects"
on public.professional_portfolio_projects
for select
to authenticated
using (
  true
);


drop policy if exists
  "Owners can read their professional portfolio media"
on public.professional_portfolio_media;

drop policy if exists
  "Authenticated users can read professional portfolio media"
on public.professional_portfolio_media;

create policy
  "Authenticated users can read professional portfolio media"
on public.professional_portfolio_media
for select
to authenticated
using (
  true
);


-- ============================================================
-- STORAGE SELECT
-- Bucket remains private.
-- Authenticated users may create short-lived signed URLs
-- only for objects that already have a matching media row.
-- Owner INSERT / DELETE policies are unchanged.
-- ============================================================

drop policy if exists
  "Owners can read their professional-portfolio objects"
on storage.objects;

drop policy if exists
  "Authenticated users can read professional-portfolio objects with media records"
on storage.objects;

create policy
  "Authenticated users can read professional-portfolio objects with media records"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'professional-portfolio'
  and public.is_professional_portfolio_storage_path(
    name,
    public.professional_portfolio_path_profile_id(name),
    public.professional_portfolio_path_project_id(name)
  )
  and exists (
    select 1
    from public.professional_portfolio_media as media
    where media.storage_path = name
      and media.profile_id
        = public.professional_portfolio_path_profile_id(name)
      and media.project_id
        = public.professional_portfolio_path_project_id(name)
  )
);
