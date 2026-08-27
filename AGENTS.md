# DIRECT GAIN — AI CODING INSTRUCTIONS

## 1. Project

Direct Gain is a trust-first mobile platform built with Expo React Native and TypeScript.

The product combines:

- Discover/social feed
- Market
- Jobs and work opportunities
- Live auctions
- Direct messaging
- User profiles
- Reputation and verification
- Secure deal flows

The application targets both iOS and Android.

Before making architectural decisions, inspect the existing project rather than assuming how it works.

Read these files when relevant:

- PROJECT.md
- ROADMAP.md
- package.json
- app.json

Preserve established architecture unless the requested task specifically requires changing it.

---

## 2. Expo Version

Expo APIs change between SDK versions.

Before using or changing Expo-specific APIs, consult documentation compatible with the Expo SDK version used by this repository.

The project currently uses Expo SDK 57.

Versioned documentation:

https://docs.expo.dev/versions/v57.0.0/

Do not blindly use examples intended for a different Expo SDK version.

---

## 3. Existing Code First

Direct Gain already contains working systems.

Before modifying a feature:

1. Search the repository for the existing implementation.
2. Read the relevant screen.
3. Read its components.
4. Read related hooks, services, stores, types and navigation.
5. Understand the existing data flow.
6. Make the smallest coherent change necessary.

Do not rebuild a working system merely because another implementation appears cleaner.

Do not create duplicate components, screens, services, stores, types or utilities when an appropriate implementation already exists.

Prefer extending existing reusable architecture.

---

## 4. Protect Working Features

Do not break existing functionality while implementing another feature.

Pay particular attention to:

- Authentication
- Navigation
- Bottom-tab behaviour
- Market
- Listing details
- Seller profiles
- Discover
- Messaging
- Conversation persistence
- Realtime messages
- Read receipts
- Supabase integration
- Gain Score
- Verification information

If a change touches one of these systems, inspect its dependencies before editing it.

Avoid broad refactors unless explicitly requested.

---

## 5. Direct Gain Design Language

Direct Gain has its own visual identity.

Primary visual direction:

- Premium dark interface
- Matte-black / near-black surfaces
- Bright opportunity green accents
- White primary text
- Muted secondary text
- Subtle green borders and glow
- Rounded premium cards
- Clear visual hierarchy
- Clean spacing
- Trust signals integrated into UI

Use existing theme tokens and shared components whenever possible.

Do not replace the Direct Gain design system with generic React Native styling.

Do not introduce unrelated colours or inconsistent component styles without a clear reason.

The experience may take inspiration from polished social and marketplace applications, but Direct Gain must retain its own identity.

---

## 6. Navigation

The primary bottom navigation contains:

- Discover
- Market
- Create
- Auctions
- My Gain

Messaging is accessible through the application but is not a visible sixth bottom-navigation item.

The central Create button is intentionally visually prominent.

Some screens intentionally hide the bottom navigation, including focused conversation experiences.

Do not change navigation structure unless the requested feature requires it.

Before changing navigation, inspect:

- navigation/BottomTabs.tsx
- navigation/MarketStack.tsx
- navigation/MessagesStack.tsx
- navigation/AppNavigator.tsx
- providers/TabBarVisibilityProvider.tsx

---

## 7. Messaging

Messaging is a core working system and should be treated carefully.

Existing architecture includes repository/service logic under:

services/messaging/

and session/state logic under:

stores/messaging/

Messaging currently includes concepts such as:

- Conversations
- Messages
- Buyer/seller roles
- Realtime updates
- Read receipts
- Market conversations
- Offers
- Deal agreements

Do not replace working Supabase-backed messaging with mock-only state.

Do not create a second competing messaging architecture.

When modifying messaging, trace the complete flow before editing:

UI -> state/session -> service/repository -> Supabase -> realtime -> UI.

---

## 8. Supabase

Supabase is part of Direct Gain's backend architecture.

Database migrations live under:

supabase/migrations/

Never expose secrets.

Never print, commit or hard-code:

- Supabase service-role keys
- Private API keys
- passwords
- access tokens
- secrets from .env

Do not modify .env unless explicitly required and understood.

Before proposing database changes, inspect existing migrations and repository code.

Prefer additive, migration-based database changes over destructive changes.

Do not casually delete tables, columns, policies or production data.

---

## 9. Trust System

Trust is a core product principle.

Important concepts include:

- Gain Score
- Identity verification
- Business verification
- Professional verification
- Community trust
- Reviews
- Transaction history
- Job history
- Auction history
- Response behaviour
- Platform conduct

Trust information should be visible where useful, especially across:

- Profiles
- Listings
- Jobs
- Auctions
- Messaging
- Deal flows

Do not reduce trust features to decorative badges only. They are part of the product architecture.

---

## 10. Product Philosophy

Direct Gain should feel like one connected ecosystem rather than several unrelated applications.

Features should reuse shared:

- Users
- Profiles
- Trust
- Messaging
- Reputation
- Listings
- Activity
- Location
- Transactions

When building something new, consider how it connects to the rest of Direct Gain.

Prefer reusable domain models and components over isolated feature-specific duplicates.

---

## 11. TypeScript

Maintain strong TypeScript typing.

Avoid:

- `any` unless genuinely unavoidable
- unnecessary type assertions
- duplicated domain types
- silently ignoring TypeScript errors

Prefer existing types under:

types/

Extend shared types when appropriate rather than creating conflicting versions.

---

## 12. File Changes

Make focused changes.

Do not:

- rewrite unrelated files
- rename large groups of files without need
- delete working functionality
- perform speculative cleanup across the repository
- replace entire systems for a small feature
- install packages unnecessarily

If a new dependency is genuinely needed, explain why before adding it.

---

## 13. Git Safety

The repository uses Git and GitHub for recovery and version history.

Never automatically:

- force push
- reset --hard
- delete branches
- rewrite Git history
- remove large groups of files
- commit secrets

Do not run destructive Git commands unless explicitly instructed.

Before substantial work, check repository status.

After completing work, clearly report which files changed.

Do not automatically commit or push unless explicitly asked.

---

## 14. Validation

After code changes, validate the work.

At minimum, use the appropriate available checks such as:

- TypeScript type checking
- existing linting
- relevant tests
- Expo/Metro compilation

Fix errors caused by the change before declaring the task complete.

Do not claim something works unless it has actually been validated or clearly state what still needs manual testing.

For UI changes, remind the developer what should be manually checked in the iOS/Android simulator when appropriate.

---

## 15. Working Style

The project owner is learning software development.

When explaining completed work:

- use clear language
- explain important technical decisions
- identify files changed
- identify anything requiring manual testing
- surface risks or uncertainties
- avoid unnecessary jargon

Do not make major product decisions on behalf of the project owner.

When requirements are genuinely ambiguous and the choice would materially affect the product, ask before implementing.

For straightforward implementation details, use reasonable engineering judgement.

---

## 16. Direct Gain Development Priority

When making trade-offs, prioritize in this order:

1. User trust and safety
2. Data integrity
3. Existing functionality
4. Clear user experience
5. Maintainable architecture
6. Performance
7. Visual polish

Do not sacrifice data integrity or working functionality for visual improvements.

---

## 17. Completion Report

After completing a coding task, provide a concise report containing:

- What was changed
- Files changed
- Validation performed
- Any remaining warnings/errors
- What should be tested manually
- Whether database/schema changes were made

Never hide errors or failed validation.