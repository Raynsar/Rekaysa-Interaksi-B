# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Deployment: https://rekaysa-interaksi-b.vercel.app

## [2.0.0] - 2026-11-24

### Added

#### Phase 1 — Analysis decisions

- Record the Phase 1 analysis report and the owner-approved decisions used as
  the seed and configuration for the implementation:
  - Q1: `INTERACTION-SPEC.md` is a standalone file at the repo root and is the
    source of truth. The embedded copy at the end of `DESIGN-SYSTEM.md`
    (lines 197–393) is ignored and left untouched.
  - Q2: `README.MD` renamed to `README.md` as a technical correction; content
    unchanged.
  - Q3: Documentation editing policy — `CHANGELOG.md` must be updated at the
    end of every phase; `README.md` may only be edited for the technical rename
    (Phase 2), the Deployment section and the Visual Validation section
    (Phase 6); `INTERACTION-SPEC.md`, `DESIGN-SYSTEM.md` and
    `ACCEPTANCE-CRITERIA.md` must remain unchanged.
  - Q4: Canonical order status remains one of six values. A temporary
    `receivedBadge` flag marks a received-but-not-completed order;
    "Selesaikan Pesanan" is enabled when `status === 'Diterima' ||
    receivedBadge === true`; on confirmation `status = 'Selesai'` and the
    badge is removed. "Diterima" is never a filter tab.
  - Q5: Seed rule `autoCompleteAt = deliveredAt + 48h`; reminder appears at
    `autoCompleteAt - 24h`; auto-complete runs only after the user chooses
    "Tunggu Otomatis".
  - Q6: Ad frequency limit = 3 impressions per day plus a 24-hour cooldown
    after the ad is closed.
  - Q7: A testing-only panel labelled "Demo" is allowed to force localStorage
    write failure (AC-039), notification failure (AC-021) and product price
    change (AC-040). It is stored in localStorage, resettable, placed outside
    the normal purchase path and is not counted as a product feature.
  - Q8: AC-037 is reported as Pass with an explicit note: single-user
    simulation only; there is no real authentication and isolation relies on
    separated localStorage keys.
- Record the injectable-clock decision: `useClock`/`timeService` own all time
  reads so 24-hour and delay logic is deterministic in tests; tested logic must
  not call `Date.now()` directly.

#### Phase 2 — Setup

- Initialize the local Git repository on branch `main` with `origin` set to
  `https://github.com/Raynsar/Rekaysa-Interaksi-B.git`.
- Scaffold `apps/web` with React + TypeScript + Vite + Lucide + Vitest/
  Testing Library and the folders `components`, `pages`, `services`, `hooks`,
  `utils`, `types`, `styles`, `tests`.
- Add `src/styles/tokens.css` translated from `DESIGN-SYSTEM.md` v2.0
  (colors, typography, spacing, radius, touch targets, layout breakpoints).
- Add Vercel-ready configuration: `npm run build` emits `dist`; SPA rewrite is
  configured in `apps/web/vercel.json`.
- Add this `CHANGELOG.md` in Keep a Changelog format; phase entries are now
  consolidated under version `2.0.0`.

#### Phase 3 — UI

- Add 11 routes (10 minimum pages plus a 404): Home, Product, Cart, Checkout,
  Orders, Order Detail (normal), Order Detail (Diterima), Order Detail
  (Selesai), Report, Account and NotFound.
- Add reusable components: `AppShell`, `AdBanner`, `StatusBadge`,
  `PriceBreakdown`, `FilterTabs`, `OrderCard`, `OrderDetail` sections,
  `ConfirmModal`, `ReportForm`, `DeliveryEstimate`, `EmptyState` and
  `ToastProvider`/toast host.
- Add a hash-based router and a token-only component stylesheet driven by
  `src/styles/tokens.css`; `npm run check:tokens` reports 85 defined tokens,
  73 used tokens, 276 `var()` usages, no undefined tokens and no hardcoded
  hex/px in component CSS.
- Save 44 headless-Chrome screenshots (11 routes × 390/768/1024/1440 px) in
  `docs/screenshots/phase3/` and the measurement evidence in
  `docs/validation/phase3/overflow.json`.
- Record overflow result: 0 horizontal overflows across 44 checks; navigation
  matches the expected pattern at every breakpoint (bottom nav < 640, tablet
  nav 640–1023, sidebar ≥ 1024); 0 primary actions covered or clipped.
- Visual validation: sampled computed styles match DESIGN-SYSTEM.md (primary
  #EE4D2D, background #F5F5F5, surface #FFFFFF, border #E5E5E5, text #212121,
  button radius 8px / height 40px / 14px / 600, badge radius 999px / 12px,
  card radius 12px, ad close 44x44px). No visual deviation found.
- Note: the Order Detail "Diterima" and "Selesai" pages use the Phase 3 demo
  seed; state changes, ticket generation and notification logic remain for
  Phase 4. The Account panel currently contains only a labelled placeholder
  button as approved.

#### Phase 4 — Persistence, auto-complete, notifications and reporting

- Add `storageService` and `usePersistentState` with transactional rollback:
  a failed write keeps the previous value and surfaces an error toast.
- Add one `AppState` (orders, cart, ad frequency, notification log, report
  drafts, tickets and counters) shared by list, detail, checkout, notifications
  and the demo panel; checkout now creates a persisted order and navigates to
  its detail page.
- Add auto-complete opt-in (`Tunggu Otomatis`) with
  `autoCompleteAt = deliveredAt + 48h` and a reminder at `autoCompleteAt - 24h`.
  All tested time logic receives `now`; `useClock`/`timeService` are the only
  clock boundary, so no tested service calls `Date.now()` directly.
- Add delayed-delivery detection with deduplicated notification IDs
  (`${orderId}:${kind}`) and failure recording that leaves order data intact.
- Add ad frequency control: at most 3 impressions per local day plus a 24-hour
  cooldown after the close button is used.
- Add report drafts persisted per order, validation (category, description,
  5MB evidence name/size only), `TKT-YYYY-NNNNNN` tickets, draft cleanup on
  success and retained input on failure.
- Add a labelled, resettable Demo panel in Account for forced localStorage
  failure, forced notification failure and product price override. It is not
  part of the normal purchase path.
- Add `getEffectivePrice` as the single price source; when the demo override is
  active, Home, Product, Cart and Checkout all show "Harga diperbarui." with
  the previous and new values.
- Add `npm run verify:phase4` (Chrome headless via CDP). Evidence: 32/32 runtime
  checks pass in `docs/validation/phase4/phase4-runtime.json`, with 16 additional
  responsive checks (4 routes × 390/768/1024/1440) in
  `docs/validation/phase4/responsive.json`. Ten screenshots of changed UI are in
  `docs/screenshots/phase4/`.
- Record verification coverage: completion → Selesai + tab + toast, modal
  cancel, reload persistence, ad close/cooldown/cap, report validation/draft/
  ticket, all three demo scenarios, auto-complete with and without opt-in.
  Formal AC statuses remain reserved for Phase 5.

#### Phase 5 — Automated tests and AC verification

- Add 5 Vitest/Testing Library test files with 38 passing cases:
  `services-pricing-time.test.ts`, `services-behavior.test.ts`,
  `hooks.test.tsx`, `components.test.tsx` and `integration.test.tsx`.
  Coverage includes pure price/time/report/ticket/notification/ad/order
  functions, all four hooks (`usePersistentState`, `useAutoComplete`,
  `useAdFrequency`, `useClock`), seven components (`PriceBreakdown`,
  `ConfirmModal`, `ReportForm`, `AdBanner`, `FilterTabs`, `ReminderBanner`,
  `DeliveryEstimate`) and end-to-end flows for completion, filter/search,
  auto-complete opt-in, duplicate prevention, reporting, navigation and
  localStorage isolation.
- Add `App` support for an optional `initialNow` prop so the injectable clock
  can be used from integration tests without changing production behaviour.
- Add `npm run verify:phase5` (Chrome headless via CDP). It captured 22
  screenshots (11 routes × 390/1440 px) in `docs/screenshots/phase5/` and a
  computed-style audit in `docs/validation/phase5/visual-audit.json`: 0 visual
  deviations from DESIGN-SYSTEM.md, 0 horizontal overflows, 0 navigation
  mismatches, 0 covered primary actions, and 0 pages over 3 seconds.
- Add the mandatory 42-row acceptance table in
  `docs/validation/phase5/ac-results.md` with columns
  `AC | Priority | Status | Bukti | Catatan`. Recap: **Pass 42 · Fail 0 ·
  Blocked 0 · Not Tested 0**. AC-037 is Pass with the Phase 1 Q8 note:
  single-user simulation, no real authentication, isolation by namespaced
  localStorage keys.
- Combine Phase 3 (`overflow.json`, 44 screenshots, token check), Phase 4
  (`phase4-runtime.json`, `responsive.json`, 10 screenshots) and the new
  Vitest/runtime evidence into the AC table. No formal status was claimed
  before Phase 5.
- Note: visual inspection by the model is limited to DOM/computed-style
  evidence; PNG screenshots are saved for owner review.

#### Phase 6 — Deployment preparation

- Confirm the final `npm run build` succeeds and emits `dist/`, and that
  `apps/web/vercel.json` contains the SPA rewrite `/(.*)` → `/index.html`.
- Expand the README Deployment section into five manual Vercel steps, leaving
  the Live URL field ready for the deployment URL.
- Extend the README Visual Validation section with pointers to
  `docs/screenshots/phase3/`, `docs/screenshots/phase4/` and
  `docs/screenshots/phase5/`.
- Consolidate the Phase 1–5 changelog entries into `2.0.0` and reserve a new
  `[Unreleased]` block for the deployment URL commit.

### Changed

- Phase 5: `App` accepts an optional `initialNow` prop; the default production
  path still uses the real clock.
- Phase 6: README now documents the five manual deployment steps and points
  Visual Validation to all three screenshot phases; no PRD, design system,
  interaction spec or acceptance criteria content was edited.
- Phase 6: changelog phase entries were regrouped under `### Added`,
  `### Changed` and `### Fixed` for version `2.0.0`.

### Fixed

- Phase 2: renamed `README.MD` to `README.md` to avoid case-sensitive path
  failures on Vercel/Linux.
- Phase 3: hid the bottom navigation from 640 px upward and showed the tablet
  top navigation between 640–1023 px, so navigation changes match the
  documented breakpoints.
- Phase 4: the hash router separates path and query so completing an order can
  open the Orders page with the "Selesai" tab already selected.
- Phase 4: moved all time reads behind `useClock`/`timeService` so tested logic
  no longer calls `Date.now()` directly.
