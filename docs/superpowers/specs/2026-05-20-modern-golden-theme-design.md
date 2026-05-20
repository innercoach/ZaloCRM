# Modern Golden Theme Design

## Goal

Move ZaloCRM toward a modern, dark-first, golden-accented, future-ready CRM style while preserving readability for dense Vietnamese CRM workflows.

## Design direction

Theme name: `Golden Future CRM`.

The product should feel like a premium enterprise SaaS app, not a cyberpunk demo. The base UI should use dark graphite surfaces, high-contrast text, subtle depth, and restrained gold accents. Gold is a highlight color for action, selection, and priority; it is not body text.

## Palette

Dark theme:

- Background: `#070A12`
- Surface: `#101522`
- Elevated surface: `#171D2E`
- Glass surface: `rgba(23, 29, 46, 0.72)`
- Primary gold: `#D6A84F`
- Gold hover: `#F0C76A`
- Gold soft: `rgba(214, 168, 79, 0.14)`
- Accent cyan: `#38BDF8`
- Success: `#22C55E`
- Warning: `#F59E0B`
- Error: `#EF4444`
- Text primary: `#F8FAFC`
- Text secondary: `#CBD5E1`
- Text muted: `#94A3B8`
- Border: `rgba(148, 163, 184, 0.18)`

Light compatibility theme:

- Background: `#F8F5EF`
- Surface: `#FFFFFF`
- Elevated surface: `#FFFDF8`
- Primary gold: `#B8872E`
- Text primary: `#111827`
- Text secondary: `#475569`
- Border: `#E5E1D8`

## Typography

Preferred future typography:

- Heading: `Space Grotesk`
- Body: `DM Sans`
- Fallback: `Inter`, `system-ui`, `sans-serif`

Implementation can keep existing font loading if external font changes are deferred, but the token system should be ready for this pairing.

## Theme behavior

Default theme should become dark-first: `golden-dark`.

The previous `legacy-dark` should not be the future target. Existing `smax-light` can remain as the light compatibility theme during migration. Theme toggle should switch between `golden-dark` and `smax-light`.

## UI priorities

First slice should update the foundation and shell, not every screen individually.

Priority order:

1. Theme tokens and Vuetify theme definitions.
2. Global CSS for app background, cards, fields, buttons, chips, tables, focus rings, and scrollbars.
3. Desktop app shell top navigation and main area.
4. Mobile app shell top bar, bottom navigation, and safe-area behavior.
5. Shared high-impact components: cards, buttons, inputs, chips, dialogs, toast, loading/offline states.
6. Core screens after foundation: Dashboard, Chat, Contacts, Zalo accounts, Settings.

## App shell requirements

Desktop shell:

- Dark graphite sticky top navigation.
- Gold active route indicator.
- Logo and workspace selector remain compact.
- Avoid emoji icons in navigation for the final theme; prefer MDI/SVG icons.
- Main area uses a dark radial gradient background and consistent content padding.

Mobile shell:

- Compact app bar with dark graphite background.
- Gold brand accent.
- Bottom navigation with visible active gold state.
- Safe-area padding for bottom nav and fixed elements.
- Offline/PWA banners remain readable in dark mode.

## Component style requirements

Buttons:

- Primary actions use gold fill or gold gradient.
- Secondary actions use dark surface with gold border or subtle surface hover.
- Destructive actions stay red.

Cards:

- Use elevated dark surfaces with soft border.
- Use glass only where it improves hierarchy.
- Avoid excessive blur on dense data screens.

Inputs:

- Dark filled or outlined fields.
- Gold focus ring.
- Text contrast must remain high.

Tables and lists:

- Dense CRM data must remain readable.
- Row hover uses subtle gold-soft or surface elevation.
- Active/selected row uses gold-soft background and gold side/inline indicator.

Chat:

- Preserve message readability.
- Self/other bubbles must have clear contrast in dark mode.
- Pending/offline states use gold only as status accent.

## Accessibility and performance

- Normal text contrast must meet 4.5:1.
- Touch targets should be at least 44px where practical on mobile.
- Focus states must be visible.
- Motion should be 150–300ms and respect `prefers-reduced-motion`.
- Avoid layout-shifting hover transforms.
- Do not use emoji as UI icons in new/updated shell elements.

## Validation

Primary acceptance path uses Docker and browser testing.

Acceptance criteria:

- `cd frontend && npm run build` passes.
- Docker app builds and starts.
- Desktop layout renders correctly at 1024px and 1440px.
- Mobile layout renders correctly at 375px and 768px.
- Dark theme is default for new sessions.
- Theme toggle switches between `golden-dark` and `smax-light`.
- Top navigation, mobile app bar, and bottom navigation use gold active states.
- Dashboard, Chat, Contacts, and Settings remain readable.
- No horizontal scroll on mobile.
- Focus rings are visible.
- Browser console has no new theme-related errors.
