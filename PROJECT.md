# Direct Gain

## Slogan

**Grow Together**

---

# What Direct Gain is

Direct Gain is a connected **daily life + work + opportunity** platform.

It is built around **one Direct Gain identity** and the experiences that person may need over time: community, Market, work, professional presence, business, auctions, messaging, trust, and local discovery.

It is **not** merely:

- a marketplace
- a jobs board
- a social network
- an auction app
- a professional networking platform
- a business hiring platform

Those experiences belong in Direct Gain. The product is how they connect, and how a person can move between them without creating disconnected identities.

A person should be able to use Direct Gain differently throughout their life, and differently from day to day. For example:

- browse community or social content
- browse Market
- buy or sell
- watch a live auction for entertainment
- bid
- discover local people or services
- find work
- build a Professional identity
- apply for opportunities
- start a business
- find customers
- advertise work
- hire people
- manage reputation and history across the platform

Uniqueness should come from connection, trust, profile presentation, local discovery, and the ability to move between daily life and work. Ordinary interactions should stay understandable: Market should still feel like a marketplace, messaging should still behave naturally, and applying for work should remain straightforward.

---

# Core product principles

## One identity, multiple presentations

**ONE DIRECT GAIN IDENTITY. MULTIPLE WAYS TO SHOW WHO YOU ARE.**

Personal, Professional, and Business are distinct **presentations** of the same Direct Gain identity. They are not three unrelated accounts.

## Familiar, distinct, useful, enjoyable, trustworthy

Direct Gain should be:

- familiar enough that anyone can use it
- different enough that people remember it
- useful enough that people need it
- enjoyable enough that people return when they do not need it
- trustworthy enough that people will buy, sell, work, and hire through it

This is an architectural product principle, not marketing copy. Do not make ordinary flows confusing in order to feel unique.

## Trust first

Every feature should help users make informed decisions.

Do not fake trust. Do not treat a verification as broader than what was actually verified.

## Community and local opportunity

Build local communities that help people connect with nearby opportunities, with appropriate privacy.

## Premium experience

Smooth animations. Modern interface. Dark theme. Clean design. Minimal clutter.

## Simplicity

Easy enough for anyone to use. Powerful enough for businesses — without collapsing Personal, Professional, and Business into one generic template.

---

# Development principle

**ARCHITECT FOR THE DESTINATION. BUILD ONLY THE NEXT USEFUL PIECE.**

Before a major system is built, ask:

1. What does this feature need today?
2. What other Direct Gain systems will eventually use it?
3. Is there a shared platform foundation that should exist instead of a one-off implementation?
4. What is the smallest useful version we should build now without blocking the eventual architecture?

Avoid both extremes:

- isolated feature-specific architecture that we already know will need replacement
- building the entire hypothetical future platform before it is needed

---

# What exists today versus planned versus future

Labels below mean:

- **EXISTS NOW** — real architecture in the current app and/or database, not a placeholder claim
- **PLANNED** — intended next-horizon platform work; not selected as an automatic next build
- **FUTURE** — destination architecture; not in current implementation scope

Honesty rules:

- Do not claim mock or placeholder screens as live domains.
- Do not describe Gain Score as a functioning production engine.
- Do not describe Wallet or payments as implemented.
- Do not describe Business as implemented.
- Do not describe live auctions as a completed domain.

## EXISTS NOW (foundation)

- One `profiles` identity per authenticated user
- `account_type` as signup class (`personal` | `business`), **not** a presentation/template selector
- `profile_presentation.active_template` as the public presentation control (`personal` | `professional` | `business`)
- Personal public profile (live)
- Professional v1 stack: core, skills, experience, credentials, private portfolio, résumé, contact actions, public presentation, activation/switching, profile messaging, identity verification groundwork
- Identity Verified status/groundwork with a **narrow** meaning (account-holder identity only)
- Market v1: listings, private media, create/publish, browsing, offers, My Listings, Manage Listing, edit details, manage photos, pause/reactivate, sold lifecycle, FREE listings, unified Create Listing composer
- Jobs/work backend and client architecture (listings, applications, completion, reviews — foundation exists; product expansion remains)
- Contextual messaging (market, job, auction, support, general), including profile conversations
- Reviews where work/transaction-backed paths exist
- Main navigation: Discover, Market, Create, Auctions, My Gain
- Trust-aware UI foundations (do not over-claim what they prove)

## EXISTS NOW but incomplete / not persisted

- Discover / community UI exists; real social/community backend remains incomplete or mock in areas
- Auctions tab exists as a placeholder, not a live-auction domain
- Market “favourite” hearts are **session-only**; Saved is not persisted
- Market listing status `removed` is reserved; there is no user-facing Archive product

## PLANNED / FUTURE (selected examples)

- Saved (persisted references; Market likely first consumer)
- Collections (organisation layer on Saved)
- Archive / History (owner/workflow history; per-domain, not one mega-table)
- Discover / community foundation (posts, following, local content)
- Deeper Jobs / hiring product
- Business presentation module and business tools
- Live auctions domain
- Business Verified, Professional Verified, Community Trusted
- Gain Score as an evidence-backed engine (not a fake score)
- Notifications platform
- Wallet / payments
- Youth / school / first-job workflows (high-risk; legal review required)

---

# Profile strategy

Personal, Professional, and Business are distinct presentation experiences of the **same** Direct Gain identity.

Do not collapse them into one generic template.

Do not repurpose `account_type` as the public template selector.

## Personal

Social and community identity and expression. Personality, posts/content over time, interests, connections/activity where appropriate, and chosen public information.

**Status:** live public Personal presentation.

## Professional

Profession, skills and services, portfolio, work history, credentials, résumé, reviews, professional reputation/trust, and contact/work actions. Availability may come later.

**Status:** substantial v1 stack implemented, including public presentation, contact actions, and activation/switching. Remaining Professional work is refinement only if a genuine gap is identified — not a missing first build.

## Business

Future business identity and brand: team, services, locations, reputation, Market presence, jobs/hiring, opportunities, contact actions, auctions where appropriate, and later business tools.

**Status:** not started. `business` may exist as a presentation option in schema/UI copy, but Business is not an implemented product module.

## Technical rules to preserve

- One profile identity (`profiles.id` = the Direct Gain person/account)
- `account_type` is **not** presentation
- `active_template` controls what other people see
- Professional data lives in additive modules, not a second account
- Business should later be additive modules, not a second account
- Controlled variation within a type (portfolio emphasis, trade emphasis, hiring emphasis) may be possible later
- Do not design uncontrolled MySpace-style customisation
- Keep a coherent Direct Gain design system

---

# Connected platform domains

Long-term ecosystem. Status is labelled honestly.

1. **Discover / Community** — posts, following, local/community content, creators, businesses, reasons to return without a transaction. **UI exists; real social/community backend incomplete/mock in areas.**
2. **Market** — buy/sell, offers, local discovery, seller trust, listing management. **Substantial v1 EXISTS NOW.** Saved listings **not** persisted.
3. **Live Auctions** — live viewing, entertainment, bidding, watch/save, history, links to profiles/businesses/Market. **FUTURE domain; tab is a placeholder.**
4. **Work / Jobs** — discovery, posting, applications, hiring, services, work history. **Foundation EXISTS NOW; product expansion remains.**
5. **People / Profiles** — Personal / Professional / Business presentations, trust, skills, portfolios, résumé, discovery. **Personal live. Professional v1 substantial. Business not started.**
6. **Messaging** — shared communication layer, relationships, contextual attachments. **Contextual messaging EXISTS NOW.**
7. **Saved** — viewer bookmarks of things to return to. **NOT persisted.**
8. **Collections** — named groups of Saved items. **FUTURE.**
9. **Archive / History** — owner/workflow inactive or completed records. **NOT a universal user-facing system.**
10. **Trust / Reputation** — verification, reviews, history, later Gain Score. **Identity Verified groundwork EXISTS NOW. Other verifications and Gain Score are FUTURE.**
11. **Local / Regional discovery** — Market, jobs, businesses, professionals/services, community, possibly auctions. Privacy must remain appropriate. **Partial (suburb/state style location EXISTS NOW).**

---

# Domain boundaries

Direct Gain must **not** become one giant generic database model.

Preserve domain ownership:

- Identity
- Presentation
- Trust
- Market
- Work
- Auctions
- Social / Community
- Messaging
- Saved
- Archive / History
- Local

Shared **contracts and patterns** are encouraged. Shared **mega-tables** are not.

Keep separate:

- listings
- jobs
- auctions
- posts
- professional modules
- résumé storage
- offers
- applications

Share concepts/patterns:

- identity
- permissions / visibility / RLS
- messaging contexts
- trust semantics (what a badge actually means)
- Saved as references, not payload copies
- location principles
- activity/history conventions per domain

---

# Platform connections (destination)

These are architectural journeys. They are **not** all implemented.

Community post → Personal → Professional → portfolio/services → Save → Message → Invite to Job

Market listing → seller → trust → profile → other listings/services

Business → services → listings → jobs → hiring → reputation

Auction → seller → profile/business → listings/other auctions

Job → Business/employer → application → messaging → completion → review/history

Professional discovery → save person → shortlist → résumé if permitted → invite to job

---

# Saved, Collections, and Archive

These are different concepts. Do not merge them.

## Saved

Viewer-controlled bookmark/reference to something they want to return to.

Potential future Saved entity kinds:

- Market listings
- auctions
- people / profiles
- Professional profiles
- Business profiles
- jobs
- services
- posts
- opportunities

## Collections

Future organisation layer **on top of Saved**. Examples:

- Cars I'm watching
- Tradies to contact
- Jobs I'm interested in
- Potential hires
- Businesses I use

## Archive / History

Owner/workflow-controlled historical or inactive records. Examples:

- own listings
- auctions
- jobs
- applications
- transactions
- work history
- owned posts where appropriate
- legitimate business hiring history

Do **not** define one giant generic archive table. Archive should remain per-domain (Market listing lifecycle, job history, and so on) with shared conventions.

**Current reality:** Saved is not persisted (session Market hearts only). Archive is not a user-facing product. Market `removed` is reserved for later owner archive and is not Stage 6 complete.

---

# Saved security principle

**SAVING SOMETHING MUST NEVER GRANT ADDITIONAL ACCESS TO IT.**

Saved should store references/relationships, not unrestricted copies of another user's private data.

Opening Saved content must respect current:

- visibility
- permission
- blocking
- deletion
- availability

If underlying content becomes unavailable, Saved must fail closed or show only minimal safe “unavailable” metadata.

This is especially important for Professional profiles, résumés, candidate information, applications, employment information, and private portfolio/work information.

---

# Résumé / candidate privacy (future)

A business may eventually:

- save a Professional
- shortlist candidates
- invite someone to a job
- access a résumé **where current permissions allow**

Saved Professional / shortlist / résumé access must **not** automatically mean a permanent unrestricted copy of another user's résumé.

Legitimate hiring-record retention is a **separate** future concept and requires privacy/legal design.

Do not implement résumé copying or employer file retention as part of Saved.

---

# Trust

Trust is a core product pillar. Be precise about what exists.

## EXISTS NOW

- Identity Verified groundwork/status
- Real reviews where transaction/work-backed paths exist
- Trust-aware UI foundations

## PLANNED / FUTURE

- Business Verified
- Professional Verified
- Community Trusted
- Gain Score as an evidence-backed engine

## Identity Verified (locked meaning)

Identity Verified means **only** that Direct Gain has confirmed the identity of the account holder through the identity verification process.

It does **not** mean:

- professionally qualified
- licensed
- background checked
- recommended
- Business Verified
- Professional Verified
- Community Trusted
- high Gain Score

A user must never be able to verify themselves.

## Gain Score (future design, not a live engine)

Gain Score is Direct Gain's intended reputation system. It cannot be purchased. It would be earned from real categories such as Market, Jobs, Auctions, Community, and Verification.

**Status:** future / not a functioning production engine. Level bands below are **planned design**, not live scoring.

### Planned Gain Score levels

- 90–100 Excellent
- 75–89 Trusted
- 60–74 Established
- 40–59 Building
- 0–39 New

Do not display a fake computed Gain Score as if it were live.

---

# Main navigation

The current main navigation remains appropriate. **Do not change it** merely because of future plans.

- Discover
- Market
- Create
- Auctions
- My Gain

Messaging is reachable in the product and does **not** need to become a sixth main tab for architectural symmetry.

Saved and Archive, when they exist, should surface quietly through **My Gain**, not as automatic new main tabs.

---

# Youth / school / first jobs (high-risk future)

Direct Gain may eventually help younger people with first jobs, casual work, early Professional identity, and potentially education or school opportunities.

These workflows are **not** approved implementation scope.

They require dedicated future work for:

- age controls
- privacy
- consent
- safeguarding
- communication restrictions
- visibility
- retention
- Australian legal and privacy requirements

Professional legal/privacy review is required before public launch of these workflows.

Do not build child or school features casually.

---

# What developers should preserve

- One Direct Gain identity; additive presentation modules
- `account_type` is not `active_template`
- Identity Verified's narrow meaning
- Domain-owned tables (listings, jobs, messages, professional modules) rather than a generic object store
- Private storage and RLS for listing media, portfolio, and résumés
- Market listing lifecycle and controlled publish (including pause ≠ sold ≠ archive)
- Accepting an offer is not automatically marking a listing sold
- Contextual messaging rather than a second competing inbox architecture
- Expo SDK 57 and existing navigation structure
- No secrets in the repository
- Additive migrations over destructive schema rewrites

---

# UI philosophy

Premium dark theme.

Floating cards.

Soft shadows.

Rounded corners.

Minimal interface.

Subtle green glow.

Direct Gain has its own visual identity. Do not replace it with generic marketplace or social-app styling.

---

# Brand colours

Primary

#9EF65A

Background

Black

Text

White

Accent

Green

---

# Intended reusable UI

These names describe the intended shared component language. Not every name is a live production system.

GainScoreBadge (future live score — do not fake)

VerificationBadges (must match actual verification meaning)

TrustCard

StoryBubble

SearchBar

LocationCard

ListingCard

JobCard

AuctionCard

BusinessCard

ProfileHeader

---

# Future features (not implemented)

Business Dashboard

Digital Business Cards

Video Listings

Live Shopping

QR Profiles

AI Search

Community Events

Secure Payments

Wallet

Subscriptions

Advertising Platform

---

# Long-term goal

Become Australia's most trusted connected platform for daily life, work, and opportunity — buying, selling, working, hiring, and belonging in one identity.

Grow Together.
