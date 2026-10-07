# Direct Gain Roadmap

This roadmap is the working plan **from checkpoint `5ae7a3e`** (Polish market listing creation and free listings) forward.

It must describe **what is actually complete**, **what remains**, **what is deferred**, and **what is high-risk**. It must not treat substantial completed systems as untouched future versions.

Direct Gain is a connected **daily life + work + opportunity** platform around **one identity** with **multiple presentations**.

Development rule:

**ARCHITECT FOR THE DESTINATION. BUILD ONLY THE NEXT USEFUL PIECE.**

Do not pick the next code feature automatically from an old version box.

---

# 1. Current foundation / completed

## Product lock (profiles)

- **Personal** = live public profile
- **Professional** = substantial v1 stack implemented, including public presentation, contact actions, and activation/switching
- **Business** = not started

Personal, Professional, and Business remain three distinct presentation experiences. They share Direct Gain identity, trust, and design language. They are not one template with renamed labels.

`account_type` is signup class. It is **not** the public presentation selector. `profile_presentation.active_template` controls what other people see.

## App foundation

- [x] Expo project created
- [x] Navigation created
- [x] Dark theme
- [x] Brand colours
- [x] Bottom navigation: Discover, Market, Create, Auctions, My Gain
- [x] Discover screen foundation (UI; social backend still incomplete)
- [x] Project documentation
- [x] Component architecture

## Professional v1 (completed — do not re-queue as next work)

Completed backend:

- Migration 013 — Professional core (headline, About, availability, service area, work preference, skills)
- Migration 014 — Experience and credentials tables + save RPCs
- Migration 015 — live fix for 42702 `profile_id` ambiguity in the collection save RPCs (`ON CONFLICT ON CONSTRAINT professional_profiles_pkey`). Applied and catalog-verified. Experience and credentials persist and display in Professional Preview.
- Migration 016 — Professional Portfolio v1 (projects, media, private `professional-portfolio` bucket, owner-only reads, `save_own_professional_portfolio`). Applied. Post-apply structure/security verification passed.
- Migration 017 — Professional Résumé v1 (one private PDF per owner, `professional-resumes` bucket, owner-only reads, `save_own_professional_resume` / `remove_own_professional_resume`). Applied. Post-apply structure/security verification passed.
- Migration 018 — résumé Storage SELECT no longer requires a metadata row during upload/RETURNING. Applied.
- Migration 019 — `professional_resume_path_profile_id` SQL parser fix so canonical owner paths parse (Storage INSERT RLS). Applied and catalog-verified.
- Later Professional/identity/presentation hardening, including Identity Verified groundwork, public Professional presentation, activation/switching, profile messaging, Personal public messaging, and realtime profile status (checkpointed after this Professional sequence; do not treat as unfinished first-build work).

Completed client (runtime verified across this sequence):

- Experience & credentials editor and Preview tab
- Skills & services presentation using existing `professional_skills` from 013 (no new table)
- Professional Portfolio v1 editor + owner preview
- Newly created Portfolio projects default to the top of the collection; manual up/down ordering remains supported
- Professional Résumé v1 owner preview + editor (PDF only, 5 MiB, private, one current file)
- In-app Direct Gain PDF viewer (WebView, private signed URL, no external browser)
- Full iOS simulator lifecycle verified for résumé: upload → view → replace → view replacement → remove → re-upload → view
- Professional hero, organisation, experience/portfolio UI
- Contact / professional actions
- Public Professional presentation and activation/switching
- Profile messaging and Personal public messaging
- Identity backend/client groundwork

**Do not list Professional public/contact as the next unfinished slice.** Remaining Professional work is optional refinement only if a genuine gap is identified.

## Market v1 (completed foundation)

Substantial Market listing foundation is implemented:

- listings
- private media
- create/publish
- browsing
- offers
- My Listings
- Manage Listing
- edit details
- manage photos
- pause/reactivate
- sold lifecycle
- FREE listings
- unified Create Listing composer

Checkpoint `5ae7a3e` is the Market polish checkpoint for FREE listings and unified Create Listing.

Not included in this completed Market v1:

- persisted Saved
- user-facing Archive
- collections

## Jobs / work foundation (completed foundation, not finished product)

Jobs is **not** an untouched future domain.

Existing real backend/client architecture includes job listings, applications, assignment-related messaging, completion, and reviews.

Future Jobs work is product/UX expansion (hiring workflows, employer/candidate tools, deeper discovery), not a greenfield Jobs rebuild.

## Messaging (completed foundation, not finished product)

Contextual messaging is real: conversations, messages, realtime, read receipts, market/job/general (and reserved auction/support) contexts, offers and conversation activity where Market offers exist.

Future messaging work is expansion (attachments, richer context, auction context when auctions exist), not “build messaging from scratch.”

## Trust (partial)

- Identity Verified groundwork/status exists, with a **narrow** meaning: Direct Gain has confirmed the account holder’s identity. It does not mean licensed, qualified, background checked, Business Verified, Professional Verified, Community Trusted, or high Gain Score.
- Reviews exist on work/transaction-backed paths.
- Gain Score is **not** a live engine.

---

# 2. Current product gaps

Honest gaps after `5ae7a3e`:

- **Business** presentation/product module — not started
- **Live auctions** — tab placeholder only
- **Discover / community** — UI exists; real social/community backend incomplete or mock in areas
- **Saved** — not persisted; Market hearts are session-only
- **Collections** — not started
- **Archive / History** — not a universal user-facing system; Market `removed` status is reserved/future
- **Gain Score** — planned design only
- **Business Verified / Professional Verified / Community Trusted** — not implemented
- **Wallet / payments** — future; not implemented
- **Notifications platform** — not implemented
- **Jobs hiring product depth** — foundation exists; broader hiring/candidate UX remains
- **Professional** — only genuine remaining gaps, not a missing v1

---

# 3. Near-term development (candidates — not auto-selected)

Do **not** start a feature because an old 0.0.x box listed it.

After this documentation update, the next **code** slice is a deliberate product decision among candidates such as:

- deeper Jobs / hiring experience (builds on existing Jobs architecture)
- real Discover / community foundation (replace mock/incomplete social with a real first slice)
- Saved contract with **Market listings as first consumer** (replace session hearts; fail closed on permission)
- remaining Professional refinement **only if a genuine gap is identified**
- Auction foundation — later than the items above unless product priority changes
- Business module — later

**Deliberately not selected as automatic next work:**

- Market-only Archive / former “Stage 6 Archive”
- Collections
- Wallet / payments
- Gain Score engine
- navigation changes
- youth / school workflows

No candidate in this list is being implemented in the documentation step.

---

# 4. Shared platform foundations (plan; do not implement here)

## Saved versus Archive (locked)

**Saved** = viewer bookmark/reference (“I want to return to this”).

**Archive / History** = owner or legitimate workflow history (“my inactive/completed records”).

**Collections** = later organisation of Saved items.

Do not merge Saved and Archive.

Do not build one giant generic archive table.

Do not implement Saved or Archive in this documentation step.

### Saved security (locked)

Saving something must **never** grant additional access to it.

Saved should store references, not unrestricted copies of another user’s private data. Opening Saved must re-check visibility, permission, blocking, deletion, and availability. Unavailable content fails closed or shows minimal safe metadata.

### Résumé / shortlist (future; not Saved-as-copy)

A business may eventually save a Professional, shortlist, invite to a job, and view a résumé **when current permission allows**. That is not a permanent unrestricted résumé copy. Legitimate hiring-record retention is a separate legal/privacy design.

### Market Archive (deferred)

Market owner archive (likely listing `removed` / historical own listings) is **deferred** until Saved vs Archive contracts are understood.

Do not implement a Market-only Archive that blocks a shared Saved/Archive distinction.

When Archive is built, keep **domain ownership** (Market listings stay Market listings). Share conventions, not a mega-table.

## Other shared contracts to plan

- typed content references (`entity_kind` + `entity_id`) for Saved later
- permissions/visibility remain table/RLS owned
- messaging contexts remain the shared communication layer
- trust badge semantics stay narrow
- location/privacy principles
- activity/history conventions per domain

---

# 5. Major future domains

## Live Auctions

Not a completed live-auction domain.

Future: live viewing, entertainment, bidding, sellers, watch/save, reminders, auction history, connections to profiles/businesses/Market.

## Business

Not started as a product module.

Future: business identity/brand, team, services, locations, reputation, Market presence, jobs/hiring, opportunities, contact actions, auctions where appropriate, later business tools.

## Discover / Community

UI foundation exists. Real posts, following, local community, events, and business promotions remain future/incomplete.

## Trust expansion

Future: Business Verified, Professional Verified, Community Trusted, evidence-backed Gain Score, trust timeline/insights. Do not fake scores or over-claim badges.

## Commerce extras (future)

AI search, QR listings, video listings, live shopping, wallet, secure payments, subscriptions, advertising — **not implemented**.

---

# 6. High-risk / legal-review areas

These require dedicated design and **professional legal/privacy/security review** before public launch of the relevant workflows:

- youth / school / first jobs: age controls, consent, safeguarding, communication limits, visibility, retention, Australian legal requirements
- résumé, candidate, and employment information
- identity verification document handling beyond the current status-only groundwork
- Business verification claims
- payments / wallet / escrow if ever built
- location precision vs privacy
- social content moderation and safety
- blocking vs Saved vs hiring-record retention

Youth/school/first-job workflows are **not** approved implementation scope.

---

# 7. Long-term platform vision

Direct Gain should remain useful as a person’s life changes: community user → seller → first job → Professional presence → contractor → business → hiring → Market and auctions — **without disconnected identities**.

Main navigation stays:

Discover · Market · Create · Auctions · My Gain

Messaging stays reachable without becoming a sixth tab. Saved and Archive, when they exist, should appear quietly in **My Gain**.

Long-term goal: Australia’s most trusted connected platform for daily life, work, and opportunity.

Grow Together.

---

# Historical version boxes (reclassified)

The old 0.0.3–0.0.9 checklists mixed **destination ideas** with **already-shipped work**. They are kept here only as history so they are not mistaken for the current plan.

## Former “v0.0.3 Trust Foundation”

Intended shared trust UI (GainScoreBadge, VerificationBadges, TrustCard, SearchBar, StoryBubble, LocationCard) and a trust-first Discover feed.

**Reclassified:** Discover UI foundation exists; Gain Score engine and full trust feed are **not** complete. Do not treat this box as current unfinished Phase 1 of the whole app.

## Former “v0.0.4 Marketplace”

Listings, categories, filters, search, saved items, seller profiles, product pages.

**Reclassified:** Market v1 listings, browsing, seller/profile links, and listing detail **exist**. **Saved items do not.** Filters/search depth may still expand. This is not an unstarted Marketplace.

## Former “v0.0.5 Profiles”

Personal, Business, editing, Gain Score history, Trust Timeline, achievements, reviews.

**Reclassified:** Personal live; Professional v1 substantial; Business not started; Gain Score history / Trust Timeline / achievements are future.

## Former “v0.0.6 Jobs”

Job listings, applications, employer/worker profiles, completed jobs, reviews.

**Reclassified:** Jobs foundation exists. Remaining work is expansion, not a blank Jobs phase.

## Former “v0.0.7 Live Auctions”

Live bidding, timer, comments, bid history, host profiles.

**Reclassified:** still future. Placeholder tab only.

## Former “v0.0.8 Messaging”

Direct messages, read receipts, typing, photo/voice/location sharing.

**Reclassified:** core contextual messaging **exists**. Richer attachments and some receipts/UX details may still expand. Not an unstarted messaging phase.

## Former “v0.0.9 Communities”

Local communities, posts, events, business promotions.

**Reclassified:** still largely future; Discover UI is not a completed community backend.
