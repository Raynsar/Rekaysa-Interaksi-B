# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
- Add this `CHANGELOG.md` in Keep a Changelog format, beginning at
  `## [Unreleased]`.
- Record the Phase 1 decisions approved by the project owner as seed and
  configuration decisions for the following phases:
  - Q1: `INTERACTION-SPEC.md` is now a standalone file at the repo root and is
    the source of truth for interaction rules. The embedded copy at the end of
    `DESIGN-SYSTEM.md` (lines 197–393) is ignored and left untouched.
  - Q2: `README.MD` renamed to `README.md` as a technical correction; content
    unchanged.
  - Q3: Updated `.md` editing policy — `CHANGELOG.md` must be updated at the
    end of every phase; `README.md` may only be edited for the technical
    rename (Phase 2) and the Deployment section + URL placeholder (Phase 6);
    `INTERACTION-SPEC.md`, `DESIGN-SYSTEM.md` and `ACCEPTANCE-CRITERIA.md`
    must remain unchanged.
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
- Record the injectable-clock decision: `useClock`/`timeService` will own all
  time reads so 24-hour and delay logic is deterministic in tests; tested
  logic must not call `Date.now()` directly.

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
- Save 44 headless-Chrome screenshots (11 routes x 390/768/1024/1440 px) in
  `docs/screenshots/phase3/` and the measurement evidence in
  `docs/validation/phase3/overflow.json`.
- Record overflow result: 0 horizontal overflows across 44 checks; navigation
  matches the expected pattern at every breakpoint (bottom nav < 640, tablet
  nav 640–1023, sidebar >= 1024); 0 primary actions covered or clipped.
- Visual validation: sampled computed styles match DESIGN-SYSTEM.md (primary
  #EE4D2D, background #F5F5F5, surface #FFFFFF, border #E5E5E5, text #212121,
  button radius 8px / height 40px / 14px / 600, badge radius 999px / 12px,
  card radius 12px, ad close 44x44px). No visual deviation found.
- Note: the Order Detail "Diterima" and "Selesai" pages use the Phase 3 demo
  seed; state changes, ticket generation and notification logic remain for
  Phase 4. The Account panel currently contains only a labelled placeholder
  button as approved.

### Changed

- Renamed `README.MD` to `README.md` to avoid case-sensitive path failures on
  Vercel/Linux.
- Phase 3: hide the bottom navigation from 640 px upward and show the tablet
  top navigation between 640–1023 px, so navigation changes match the
  documented breakpoints.

Deployment URL: `[URL Vercel diisi setelah deploy]`
