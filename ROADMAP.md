# Direct Gain Roadmap

## Current Version

v0.0.3

---

# Professional Profile (in development)

Personal, Professional, and Business are three distinct
profile experiences. They share Direct Gain identity,
trust, and design language. They are not one template
with renamed labels.

Current product lock:

- Personal = live / current public profile
- Professional = owner preview only (not activated)
- Business = not started

Completed backend:

- Migration 013 — Professional core (headline, About,
  availability, service area, work preference, skills)
- Migration 014 — Experience and credentials tables +
  save RPCs
- Migration 015 — live fix for 42702 `profile_id`
  ambiguity in the collection save RPCs (`ON CONFLICT
  ON CONSTRAINT professional_profiles_pkey`). Applied
  and catalog-verified. Experience and credentials
  persist and display in Professional Preview.
- Migration 016 — Professional Portfolio v1 (projects,
  media, private `professional-portfolio` bucket,
  owner-only reads, `save_own_professional_portfolio`).
  Applied. Post-apply structure/security verification
  passed.

Completed client (runtime verified):

- Experience & credentials editor and Preview tab
- Skills & services presentation using existing
  `professional_skills` from 013 (no new table)
- Professional Portfolio v1 editor + owner preview
- Newly created Portfolio projects default to the
  top of the collection; manual up/down ordering
  remains supported

Later:

- Résumé / contact actions
- Public Professional activation

---

# Phase 1 — Foundation ✅

- [x] Expo project created
- [x] Navigation created
- [x] Dark theme
- [x] Brand colours
- [x] Bottom navigation
- [x] Discover screen foundation
- [x] Project documentation
- [x] Component architecture

---

# Version 0.0.3 — Trust Foundation 🚧

## Components

- [ ] GainScoreBadge
- [ ] VerificationBadges
- [ ] TrustCard
- [ ] SearchBar
- [ ] StoryBubble
- [ ] LocationCard

## Discover

- [ ] Trust feed
- [ ] Marketplace card
- [ ] Jobs card
- [ ] Auctions card
- [ ] Local businesses
- [ ] Regional content

---

# Version 0.0.4 — Marketplace

- [ ] Marketplace listings
- [ ] Categories
- [ ] Filters
- [ ] Search
- [ ] Saved items
- [ ] Seller profiles
- [ ] Product pages

---

# Version 0.0.5 — Profiles

- [ ] Personal profile
- [ ] Business profile
- [ ] Profile editing
- [ ] Gain Score history
- [ ] Trust Timeline
- [ ] Achievements
- [ ] Reviews

---

# Version 0.0.6 — Jobs

- [ ] Job listings
- [ ] Applications
- [ ] Employer profiles
- [ ] Worker profiles
- [ ] Completed jobs
- [ ] Reviews

---

# Version 0.0.7 — Live Auctions

- [ ] Live bidding
- [ ] Auction timer
- [ ] Live comments
- [ ] Bid history
- [ ] Auction host profiles

---

# Version 0.0.8 — Messaging

- [ ] Direct messages
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Photo sharing
- [ ] Voice messages
- [ ] Location sharing

---

# Version 0.0.9 — Communities

- [ ] Local communities
- [ ] Community posts
- [ ] Events
- [ ] Business promotions

---

# Future Ideas

## Trust System

- Community achievements
- Reputation history
- Trust insights
- Verified professionals
- Business verification
- Trust Timeline

## Marketplace

- AI search
- QR listings
- Video listings
- Live shopping

## Business

- Business dashboard
- Analytics
- Advertisements
- Subscriptions

---

# Long-Term Goal

Create Australia's most trusted platform for buying, selling, working and connecting.

Grow Together.