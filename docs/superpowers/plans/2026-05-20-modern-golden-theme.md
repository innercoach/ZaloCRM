# Modern Golden Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dark-first modern golden theme foundation for ZaloCRM while preserving a readable light compatibility mode.

**Architecture:** Add a new `golden-dark` Vuetify theme and map existing Smax CSS tokens to theme-aware variables. Modernize the desktop and mobile app shells first, then apply global component styling for high-impact Vuetify surfaces without rewriting every feature screen. Keep the migration surgical so dense CRM pages remain functional while later screen-specific polish can happen incrementally.

**Tech Stack:** Vue 3, Vuetify 4, Vite 8, TypeScript, CSS custom properties, Docker Compose.

---

## File map

- Modify `frontend/src/plugins/vuetify.ts` — add `golden-dark`, update default theme, keep `smax-light` as light compatibility, and point defaults at the new palette.
- Modify `frontend/src/assets/tokens.css` — introduce theme-aware golden tokens and dark/light variable overrides.
- Modify `frontend/src/assets/main.css` — add global dark/golden component styling for cards, buttons, fields, chips, tables, scrollbars, focus states, and reduced motion.
- Modify `frontend/src/layouts/DefaultLayout.vue` — switch desktop shell from Smax/cyan/emoji style toward dark graphite and gold active states.
- Modify `frontend/src/layouts/MobileLayout.vue` — align mobile app bar with golden dark theme and safe-area behavior.
- Modify `frontend/src/components/BottomNav.vue` — add gold active state and dark surface styling.
- Modify `frontend/src/components/MobileQuickActions.vue` — style floating action button/menu for gold theme.
- Validate with `cd frontend && npm run build`, Docker startup, and browser checks at desktop/mobile widths.

---

### Task 1: Add `golden-dark` Vuetify theme

**Files:**
- Modify: `frontend/src/plugins/vuetify.ts`

- [ ] **Step 1: Replace `frontend/src/plugins/vuetify.ts` with the new theme setup**

```ts
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const savedTheme = localStorage.getItem('theme');
const defaultTheme = savedTheme === 'smax-light' ? 'smax-light' : 'golden-dark';

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme,
    themes: {
      'golden-dark': {
        dark: true,
        colors: {
          background: '#070A12',
          surface: '#101522',
          'surface-variant': '#171D2E',
          primary: '#D6A84F',
          secondary: '#CBD5E1',
          accent: '#38BDF8',
          error: '#EF4444',
          warning: '#F59E0B',
          success: '#22C55E',
          info: '#38BDF8',
          'on-background': '#F8FAFC',
          'on-surface': '#F8FAFC',
          'on-primary': '#070A12',
          'on-secondary': '#070A12',
        },
      },
      'smax-light': {
        dark: false,
        colors: {
          background: '#F8F5EF',
          surface: '#FFFFFF',
          'surface-variant': '#FFFDF8',
          primary: '#B8872E',
          secondary: '#475569',
          accent: '#B8872E',
          error: '#DC2626',
          warning: '#D97706',
          success: '#16A34A',
          info: '#0284C7',
          'on-background': '#111827',
          'on-surface': '#111827',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'flat' },
    VTextField: { variant: 'outlined', density: 'compact' },
    VSelect: { variant: 'outlined', density: 'compact' },
    VAutocomplete: { variant: 'outlined', density: 'compact' },
    VTextarea: { variant: 'outlined', density: 'compact' },
    VCard: { rounded: 'lg', variant: 'flat' },
    VChip: { rounded: 'lg', size: 'small' },
    VDialog: { maxWidth: 600 },
  },
});
```

- [ ] **Step 2: Run frontend build**

```bash
cd frontend && npm run build
```

Expected: PASS.

- [ ] **Step 3: Commit if commits are enabled for this execution**

```bash
git add frontend/src/plugins/vuetify.ts
git commit -m "feat(theme): add golden dark vuetify theme"
```

---

### Task 2: Add golden design tokens

**Files:**
- Modify: `frontend/src/assets/tokens.css`

- [ ] **Step 1: Replace the `:root` token block with theme-aware base tokens**

Replace the existing `:root { ... }` block at the top of `tokens.css` with:

```css
:root {
  --gold-bg: #070a12;
  --gold-surface: #101522;
  --gold-surface-elevated: #171d2e;
  --gold-surface-glass: rgba(23, 29, 46, 0.72);
  --gold-primary: #d6a84f;
  --gold-primary-hover: #f0c76a;
  --gold-primary-soft: rgba(214, 168, 79, 0.14);
  --gold-accent-cyan: #38bdf8;
  --gold-success: #22c55e;
  --gold-warning: #f59e0b;
  --gold-error: #ef4444;
  --gold-text: #f8fafc;
  --gold-text-secondary: #cbd5e1;
  --gold-text-muted: #94a3b8;
  --gold-border: rgba(148, 163, 184, 0.18);
  --gold-focus-ring: rgba(214, 168, 79, 0.28);

  --smax-primary: var(--gold-primary);
  --smax-primary-hover: var(--gold-primary-hover);
  --smax-primary-soft: var(--gold-primary-soft);
  --smax-success: var(--gold-success);
  --smax-warning: var(--gold-warning);
  --smax-info: var(--gold-accent-cyan);
  --smax-error: var(--gold-error);
  --smax-grey-50: #111827;
  --smax-grey-100: var(--gold-bg);
  --smax-grey-200: var(--gold-border);
  --smax-grey-300: rgba(148, 163, 184, 0.32);
  --smax-grey-700: var(--gold-text-muted);
  --smax-text: var(--gold-text);
  --smax-bg: var(--gold-surface);
  --smax-header-bg: rgba(7, 10, 18, 0.92);
  --smax-bubble-self: rgba(214, 168, 79, 0.18);
  --smax-group-bg: rgba(56, 189, 248, 0.12);
  --smax-female: #e879f9;
  --smax-male: #38bdf8;
  --smax-chip-red: #ef4444;            --smax-chip-red-text: #fecaca;
  --smax-chip-red-active: #dc2626;
  --smax-chip-purple: #a855f7;         --smax-chip-purple-text: #e9d5ff;
  --smax-chip-purple-active: #7e22ce;
  --smax-chip-orange: #f59e0b;         --smax-chip-orange-text: #fde68a;
  --smax-chip-orange-active: #d97706;
  --smax-chip-green: #22c55e;          --smax-chip-green-text: #bbf7d0;
  --smax-chip-green-active: #16a34a;
  --smax-chip-blue: #38bdf8;           --smax-chip-blue-text: #bae6fd;
  --smax-chip-blue-active: #0284c7;
  --smax-chip-yellow: #d6a84f;         --smax-chip-yellow-text: #fef3c7;
  --smax-chip-yellow-active: #b8872e;
  --smax-font-base: 14.3px;
  --smax-font-small: 12px;
  --smax-font-tiny: 11px;
  --smax-line-height: 1.5;
  --smax-radius-sm: 6px;
  --smax-radius-md: 9px;
  --smax-radius-lg: 12px;
  --smax-radius-xl: 16px;
  --smax-topnav-h: 56px;
}
```

- [ ] **Step 2: Add light compatibility overrides after the root block**

```css
.v-theme--smax-light {
  --gold-bg: #f8f5ef;
  --gold-surface: #ffffff;
  --gold-surface-elevated: #fffdf8;
  --gold-surface-glass: rgba(255, 255, 255, 0.86);
  --gold-primary: #b8872e;
  --gold-primary-hover: #94691f;
  --gold-primary-soft: rgba(184, 135, 46, 0.12);
  --gold-accent-cyan: #0284c7;
  --gold-text: #111827;
  --gold-text-secondary: #475569;
  --gold-text-muted: #64748b;
  --gold-border: #e5e1d8;
  --gold-focus-ring: rgba(184, 135, 46, 0.24);
  --smax-grey-50: #fffdf8;
  --smax-grey-100: #f8f5ef;
  --smax-grey-200: #e5e1d8;
  --smax-grey-300: #d8d1c3;
  --smax-grey-700: #475569;
  --smax-text: #111827;
  --smax-bg: #ffffff;
  --smax-header-bg: #171d2e;
  --smax-bubble-self: rgba(184, 135, 46, 0.16);
  --smax-group-bg: rgba(2, 132, 199, 0.10);
}
```

- [ ] **Step 3: Run frontend build**

```bash
cd frontend && npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit if commits are enabled for this execution**

```bash
git add frontend/src/assets/tokens.css
git commit -m "feat(theme): add golden design tokens"
```

---

### Task 3: Add global golden component styling

**Files:**
- Modify: `frontend/src/assets/main.css`

- [ ] **Step 1: Update font import**

Replace the existing first line with:

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
```

- [ ] **Step 2: Update global font and background**

Replace the `font-family`, `background`, and `color` values in the `html, body` block with:

```css
  font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background:
    radial-gradient(circle at top left, rgba(214, 168, 79, 0.14), transparent 30rem),
    var(--gold-bg);
  color: var(--gold-text);
```

- [ ] **Step 3: Add global golden theme CSS after `#app { height: 100%; }`**

```css
.v-theme--golden-dark .v-application,
.v-theme--smax-light .v-application {
  background:
    radial-gradient(circle at top left, rgba(214, 168, 79, 0.14), transparent 30rem),
    var(--gold-bg) !important;
  color: var(--gold-text) !important;
}

.v-theme--golden-dark h1,
.v-theme--golden-dark h2,
.v-theme--golden-dark h3,
.v-theme--smax-light h1,
.v-theme--smax-light h2,
.v-theme--smax-light h3 {
  font-family: "Space Grotesk", "DM Sans", system-ui, sans-serif;
}

.v-theme--golden-dark .v-card,
.v-theme--smax-light .v-card {
  background: var(--gold-surface) !important;
  border: 1px solid var(--gold-border) !important;
  color: var(--gold-text) !important;
}

.v-theme--golden-dark .v-btn--variant-flat.bg-primary,
.v-theme--smax-light .v-btn--variant-flat.bg-primary {
  background: linear-gradient(135deg, var(--gold-primary), var(--gold-primary-hover)) !important;
  color: #070a12 !important;
}

.v-theme--golden-dark .v-field,
.v-theme--smax-light .v-field {
  background: color-mix(in srgb, var(--gold-surface-elevated) 72%, transparent) !important;
  border-radius: var(--smax-radius-md) !important;
}

.v-theme--golden-dark .v-field--focused,
.v-theme--smax-light .v-field--focused {
  box-shadow: 0 0 0 3px var(--gold-focus-ring);
}

.v-theme--golden-dark .v-list,
.v-theme--golden-dark .v-menu > .v-overlay__content,
.v-theme--smax-light .v-list,
.v-theme--smax-light .v-menu > .v-overlay__content {
  background: var(--gold-surface-elevated) !important;
  color: var(--gold-text) !important;
  border: 1px solid var(--gold-border);
}

.v-theme--golden-dark .v-list-item:hover,
.v-theme--smax-light .v-list-item:hover {
  background: var(--gold-primary-soft) !important;
}

.v-theme--golden-dark .v-list-item--active,
.v-theme--smax-light .v-list-item--active {
  background: var(--gold-primary-soft) !important;
  color: var(--gold-primary) !important;
}

.v-theme--golden-dark ::-webkit-scrollbar,
.v-theme--smax-light ::-webkit-scrollbar { width: 8px; height: 8px; }
.v-theme--golden-dark ::-webkit-scrollbar-track,
.v-theme--smax-light ::-webkit-scrollbar-track { background: transparent; }
.v-theme--golden-dark ::-webkit-scrollbar-thumb,
.v-theme--smax-light ::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--gold-primary) 36%, transparent);
  border-radius: 999px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Run frontend build**

```bash
cd frontend && npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit if commits are enabled for this execution**

```bash
git add frontend/src/assets/main.css
git commit -m "feat(theme): style global golden surfaces"
```

---

### Task 4: Modernize desktop shell

**Files:**
- Modify: `frontend/src/layouts/DefaultLayout.vue`

- [ ] **Step 1: Replace emoji nav icons with MDI icon names**

Replace `primaryTabs` with:

```ts
const primaryTabs: NavTab[] = [
  { path: '/',             label: 'Dashboard',  icon: 'mdi-view-dashboard-outline', matchPrefix: '/$' },
  { path: '/chat',         label: 'Tin nhắn',   icon: 'mdi-message-text-outline' },
  { path: '/friends',      label: 'Bạn bè',     icon: 'mdi-account-heart-outline' },
  { path: '/contacts',     label: 'Khách hàng', icon: 'mdi-account-group-outline' },
  { path: '/appointments', label: 'Lịch hẹn',   icon: 'mdi-calendar-clock-outline' },
  { path: '/analytics',    label: 'Phân tích',  icon: 'mdi-chart-line' },
  { path: '/reports',      label: 'Báo cáo',    icon: 'mdi-file-chart-outline' },
];
```

- [ ] **Step 2: Render nav icons with `v-icon`**

Replace:

```vue
<span class="ic">{{ tab.icon }}</span>{{ tab.label }}
```

with:

```vue
<v-icon class="ic" size="16">{{ tab.icon }}</v-icon>{{ tab.label }}
```

- [ ] **Step 3: Replace Automation and Settings emoji icons**

Replace:

```vue
<span class="ic">⚡</span>Automation<span class="caret">▾</span>
```

with:

```vue
<v-icon class="ic" size="16">mdi-lightning-bolt-outline</v-icon>Automation<span class="caret">▾</span>
```

Replace:

```vue
<span class="ic">⚙</span>Cài đặt<span class="caret">▾</span>
```

with:

```vue
<v-icon class="ic" size="16">mdi-cog-outline</v-icon>Cài đặt<span class="caret">▾</span>
```

- [ ] **Step 4: Update theme toggle logic**

Replace:

```ts
const isDark = ref((localStorage.getItem('theme') || 'smax-light') === 'legacy-dark');
```

with:

```ts
const isDark = ref((localStorage.getItem('theme') || 'golden-dark') === 'golden-dark');
```

Replace the mounted theme block with:

```ts
onMounted(() => {
  const saved = localStorage.getItem('theme') || 'golden-dark';
  theme.global.name.value = saved;
  isDark.value = saved === 'golden-dark';
});
```

Replace `toggleTheme` with:

```ts
function toggleTheme() {
  const next = isDark.value ? 'smax-light' : 'golden-dark';
  isDark.value = !isDark.value;
  theme.global.name.value = next;
  localStorage.setItem('theme', next);
}
```

- [ ] **Step 5: Update menu title**

Replace:

```vue
:title="isDark ? 'Theme sáng' : 'Theme tối (legacy)'"
```

with:

```vue
:title="isDark ? 'Theme sáng' : 'Theme tối golden'"
```

- [ ] **Step 6: Add/replace shell styles**

In the scoped style, update these selectors to use golden variables:

```css
.smax-topnav {
  background: linear-gradient(180deg, rgba(16, 21, 34, 0.96), rgba(7, 10, 18, 0.92));
  color: var(--gold-text);
  height: var(--smax-topnav-h);
  display: flex; align-items: center;
  padding: 0 14px; gap: 6px;
  flex-shrink: 0;
  position: sticky; top: 0; z-index: 100;
  border-bottom: 1px solid var(--gold-border);
  backdrop-filter: blur(14px);
}

.logo {
  width: 36px; height: 36px;
  background: var(--gold-surface-elevated); border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-right: 4px;
  text-decoration: none;
  overflow: hidden;
  padding: 2px;
  border: 1px solid var(--gold-border);
}

.workspace {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--gold-border);
  display: flex; align-items: center; gap: 7px;
  padding: 7px 11px; border-radius: 10px;
  margin-right: 13px;
  cursor: pointer; color: var(--gold-text);
  font-size: 13px;
}
.workspace:hover { background: var(--gold-primary-soft); border-color: rgba(214, 168, 79, 0.34); }
.ws-logo { background: linear-gradient(135deg, var(--gold-primary), var(--gold-primary-hover)); color: #070a12; }

.nav-tab {
  color: var(--gold-text-secondary);
  border: 1px solid transparent;
  background: transparent;
}
.nav-tab:hover {
  color: var(--gold-text);
  background: rgba(255,255,255,0.05);
  border-color: var(--gold-border);
}
.nav-tab.active {
  color: var(--gold-primary);
  background: var(--gold-primary-soft);
  border-color: rgba(214, 168, 79, 0.32);
}
.smax-main {
  background:
    radial-gradient(circle at top left, rgba(214, 168, 79, 0.14), transparent 30rem),
    var(--gold-bg);
  color: var(--gold-text);
}
```

Keep existing sizing/layout rules not listed above unless they conflict.

- [ ] **Step 7: Run frontend build**

```bash
cd frontend && npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit if commits are enabled for this execution**

```bash
git add frontend/src/layouts/DefaultLayout.vue
git commit -m "feat(theme): modernize desktop golden shell"
```

---

### Task 5: Modernize mobile shell and bottom navigation

**Files:**
- Modify: `frontend/src/layouts/MobileLayout.vue`
- Modify: `frontend/src/components/BottomNav.vue`
- Modify: `frontend/src/components/MobileQuickActions.vue`

- [ ] **Step 1: Update mobile theme toggle**

In `MobileLayout.vue`, replace theme initialization and toggle logic with the same `golden-dark` / `smax-light` logic used in Task 4:

```ts
const isDark = ref((localStorage.getItem('theme') || 'golden-dark') === 'golden-dark');

onMounted(() => {
  const saved = localStorage.getItem('theme') || 'golden-dark';
  theme.global.name.value = saved;
  isDark.value = saved === 'golden-dark';
});

function toggleTheme() {
  const next = isDark.value ? 'smax-light' : 'golden-dark';
  isDark.value = !isDark.value;
  theme.global.name.value = next;
  localStorage.setItem('theme', next);
}
```

- [ ] **Step 2: Replace inline mobile app bar styling with classes**

In `MobileLayout.vue`, change:

```vue
<v-app-bar density="compact" flat>
```

To:

```vue
<v-app-bar density="compact" flat class="mobile-golden-appbar">
```

Replace the logo wrapper inline background with class `mobile-brand-mark`:

```vue
<div class="d-flex align-center justify-center mobile-brand-mark">
```

Replace the CRM accent inline color with class:

```vue
<span class="font-weight-bold text-body-1">Zalo<span class="mobile-brand-accent">CRM</span></span>
```

- [ ] **Step 3: Add mobile shell styles**

Add to `MobileLayout.vue`:

```vue
<style scoped>
.mobile-golden-appbar {
  background: linear-gradient(180deg, rgba(16, 21, 34, 0.96), rgba(7, 10, 18, 0.92)) !important;
  border-bottom: 1px solid var(--gold-border);
  color: var(--gold-text) !important;
  padding-top: env(safe-area-inset-top);
}

.mobile-brand-mark {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, var(--gold-primary), var(--gold-primary-hover));
  border-radius: 8px;
  color: #070a12;
}

.mobile-brand-accent {
  color: var(--gold-primary);
}
</style>
```

- [ ] **Step 4: Style `BottomNav.vue`**

Add `class="golden-bottom-nav"` to `<v-bottom-navigation>` and add:

```vue
<style scoped>
.golden-bottom-nav {
  background: rgba(16, 21, 34, 0.96) !important;
  border-top: 1px solid var(--gold-border);
  color: var(--gold-text-secondary) !important;
  backdrop-filter: blur(14px);
}

.golden-bottom-nav :deep(.v-btn--active) {
  color: var(--gold-primary) !important;
}

.golden-bottom-nav :deep(.v-btn) {
  min-width: 64px;
}
</style>
```

- [ ] **Step 5: Style `MobileQuickActions.vue`**

Replace inline wrapper style with class `mobile-quick-actions`, set the button class `golden-fab`, and add:

```vue
<style scoped>
.mobile-quick-actions {
  position: fixed;
  bottom: calc(80px + env(safe-area-inset-bottom));
  right: 16px;
  z-index: 50;
}

.golden-fab {
  background: linear-gradient(135deg, var(--gold-primary), var(--gold-primary-hover)) !important;
  color: #070a12 !important;
}
</style>
```

- [ ] **Step 6: Run frontend build**

```bash
cd frontend && npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit if commits are enabled for this execution**

```bash
git add frontend/src/layouts/MobileLayout.vue frontend/src/components/BottomNav.vue frontend/src/components/MobileQuickActions.vue
git commit -m "feat(theme): modernize mobile golden shell"
```

---

### Task 6: Browser and Docker validation

**Files:**
- No source changes expected unless validation finds a bug.

- [ ] **Step 1: Run frontend build**

```bash
cd frontend && npm run build
```

Expected: PASS.

- [ ] **Step 2: Start Docker dev stack**

```bash
docker compose -f docker-compose.dev.yml up --build
```

Expected: frontend and backend containers start successfully.

- [ ] **Step 3: Browser validation**

Open the Docker-served app in Chrome and test:

- New session defaults to `golden-dark`.
- Theme toggle switches to `smax-light` and back to `golden-dark`.
- Desktop widths: 1024px and 1440px.
- Mobile widths: 375px and 768px.
- Routes: `/`, `/chat`, `/contacts`, `/settings`.
- No mobile horizontal scroll.
- Top navigation active state is gold.
- Bottom navigation active state is gold.
- Input focus rings are visible.
- Browser console has no new theme-related errors.

- [ ] **Step 4: Production-like validation when feasible**

```bash
docker compose up -d --build
curl http://localhost:3080/health
```

Expected: health endpoint returns success and the app shell renders with `golden-dark`.

- [ ] **Step 5: Commit validation fixes if commits are enabled**

```bash
git add frontend/src/plugins/vuetify.ts frontend/src/assets/tokens.css frontend/src/assets/main.css frontend/src/layouts frontend/src/components
git commit -m "fix(theme): address golden theme validation issues"
```

---

## Self-review

Spec coverage:

- Dark-first `golden-dark`: Task 1.
- Light compatibility: Task 1 and Task 2.
- Palette and tokens: Task 2.
- Global components: Task 3.
- Desktop shell: Task 4.
- Mobile shell and bottom nav: Task 5.
- Docker/browser validation: Task 6.
- Avoid emoji icons in updated shell nav: Task 4.

Placeholder scan: no TBD/TODO placeholders. Conditional commit steps are explicit because execution may be no-commit.

Type consistency: theme names are consistently `golden-dark` and `smax-light`; token names consistently use `--gold-*` and existing `--smax-*` compatibility aliases.
