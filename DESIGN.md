# Design System: Digital Fabrication Network Web
**Project ID:** dfn-web-app-frontend-core-routes

## Scope and Source Priority
This document is intentionally scoped to these routes in the frontend codebase, which represent the core public-facing narrative and functional pillars of the DFN web presence:
- Landing: `frontend/src/app/page.tsx`
- Stakeholders: `frontend/src/app/stakeholders/page.tsx`
- Prototyping: `frontend/src/app/prototyping/page.tsx`
- Manifesto: `frontend/src/app/manifesto/page.tsx`

Priority order for decisions in this file:
1. Skill guidance (`design-md`, `frontend-design`, `shadcn`)
2. Stable visual patterns repeated across the scoped routes
3. One-off route details (lowest trust)

## 1. Visual Theme and Atmosphere
Industrial optimism with editorial clarity.

The interface should feel like a precision manufacturing control room translated into a public-facing product brand: clean, high-contrast, and mission-forward. The dominant mood is "calm authority" rather than playful startup energy. Visual rhythm relies on large headline typography, strong card silhouettes, and structured section alternation (light surface, darker emphasis band, return to light).

Primary aesthetic traits:
- Strong geometric cards with generous corner radius
- Bright technical blues for trust and action emphasis
- Light neutral canvases for readability and data-like clarity
- Occasional dark/high-contrast sections to mark strategic narrative pivots
- Controlled motion that introduces confidence, not distraction

## 2. Color Palette and Roles
Use semantic names in code and documentation. Hex values below are the current baseline.

- Forge Blue (`#006098`): Primary brand action color. Used for primary buttons, active nav states, and key icon accents.
- Horizon Blue (`#007ABF`): Gradient partner for CTA surfaces and momentum states.
- Deep Foundry (`#004873`): High-trust anchor color for dark sections, emphasis headings, and contrast text.
- Signal Tint (`#CEE5FF`): Soft alert/info badge background for section labels and overline chips.
- Signal Ink (`#004A77`): Text on tinted chips and low-density technical highlights.
- Graphite Core (`#191C1E`): Primary body/headline ink on light backgrounds.
- Cloud Surface (`#F7F9FB`): Main page canvas.
- Panel Surface (`#F2F4F6`): Secondary section background and soft container fills.
- Mist Border (`#E6E8EA`): Subtle surfaces, separators, and neutral control fills.
- Ice Accent (`#98CBFF`): Decorative quote/icon accent in editorial sections.
- White (`#FFFFFF`): Elevated cards, forms, and inverse CTA surfaces.

Color behavior:
- Primary CTA: vertical gradient from Forge Blue to Horizon Blue.
- Secondary CTA: light neutral background with Deep Foundry text.
- Dark narrative bands: Deep Foundry with desaturated light-blue support text.
- Avoid introducing unrelated hue families unless functionally required.

## 3. Typography Rules
Current state uses Inter + Material Symbols.

Skills-first direction:
- Keep technical readability but add stronger typographic character over time.
- For now, preserve existing hierarchy behavior while migrating toward a distinctive display/body pairing.

Hierarchy baseline:
- Hero headlines: Extra bold/black, very tight tracking, compressed line-height.
- Section titles: Bold to black, clear hierarchy break from body copy.
- Body: Medium optical size, generous line-height for long narrative blocks.
- Overlines/chips: Uppercase, high letter spacing, bold weight.
- Metadata and utility labels: Small size, uppercase or semi-condensed visual weight.

Typography constraints:
- Keep readable contrast in all surfaces.
- Do not use decorative fonts in dense informational sections.
- Preserve sentence clarity over novelty.

## 4. Component Stylings
Shadcn is the preferred implementation model for new and refactored UI.

### Buttons
- Shape: Subtly rounded rectangles (`rounded-xl` equivalent) for standard actions.
- Primary: Forge Blue to Horizon Blue gradient, white text, elevated shadow.
- Secondary: White or neutral surface, Deep Foundry text, gentle hover lift.
- Interaction: Small translate or scale on hover/active, never aggressive bounce.

### Cards and Containers
- Shape language:
  - Standard cards: softly rounded (`rounded-2xl` equivalent)
  - Feature blocks/hero containers: generously rounded (`rounded-[2rem]` to `rounded-[3rem]` feel)
- Elevation: whisper-soft to moderate shadows on light surfaces.
- Content density: medium. Prefer clear headings, one supporting paragraph, then action or metadata.

### Navigation
- Sticky, translucent top bar with blur and thin border.
- Active route indicated by bottom border + stronger color weight.
- Desktop-first horizontal nav with compact mobile fallback behavior.

### Form Controls
- Rounded, low-contrast neutral fields on light backgrounds.
- Focus state should use Forge Blue ring or border indicator.
- Minimize harsh borders; rely on surface differentiation and focus affordances.

### Iconography
- Use one icon family per interface area.
- Icons support hierarchy, not decoration noise.
- Keep icon color semantic (action, neutral, inverse) and consistent per section.

## 5. Layout Principles
- Max content width: route-level containers cluster around wide desktop rails (roughly `max-w-7xl` to `max-w-[1400px]`).
- Section cadence: alternate between bright neutral and soft-gray surfaces to segment narrative.
- Spacing scale:
  - Vertical section spacing is generous and editorial.
  - Internal card spacing is moderate and consistent.
  - Hero areas use the largest spacing budget.
- Composition:
  - Two-column hero and feature bands on large screens.
  - Single-column collapse on small screens with preserved hierarchy.
  - Asymmetric blocks are acceptable when anchored by clear alignment lines.

## 6. Motion and Interaction
Motion should communicate progression and confidence:
- Entrance: upward reveal and slight opacity ramp for copy blocks.
- Scroll: staggered card reveal for stats, service grids, and pillar cards.
- Hover: subtle lift or icon color inversion on actionable elements.
- Ambient: slow, low-amplitude float effects only for hero media.

Accessibility safeguards:
- Respect reduced-motion preferences by disabling non-essential animation.
- Never rely on motion as the only cue for interactivity.

## 7. Shadcn-First Implementation Guidance (Key)
Current shadcn context in this repo shows:
- Next.js App Router + RSC
- Tailwind v4
- No installed shadcn components yet (`components: []`)

Implementation policy for upcoming frontend work:
1. Add and compose shadcn primitives before custom handcrafted UI.
2. Use semantic color tokens (`bg-primary`, `text-muted-foreground`, etc.) rather than hardcoded utility color classes in new components.
3. Use shadcn composition patterns (Card/Header/Content/Footer, TabsList/TabsTrigger, etc.) for maintainability and accessibility.
4. Keep layout utilities in `className`, but keep visual theming inside tokenized system variables.
5. Preserve existing DFN visual language while migrating route-by-route, not via broad rewrite.

Suggested first migration targets for these scoped routes:
- Header/nav wrapper
- Primary and secondary button primitives
- Reusable feature/stat card primitives
- Form field primitive used in CTA/application blocks

## 8. Non-Goals
- This file does not define patterns from other routes.
- This file does not use template files as style truth.
- This file does not prescribe a full redesign, only a stable semantic system for incremental alignment.

## 8.1 Absolute Content Authenticity Rule (Blog)
- Absolute rule: the Blog route must not render placeholder, mocked, synthetic, or hardcoded article inventory.
- Blog cards, counts, categories, and metadata must be sourced from real backend-backed records.
- If no real data exists, the UI must show explicit empty-state messaging rather than fabricated content.
- This rule is mandatory for all current and future Blog route updates.

## 9. Implementation Assets (Operationalization)
The following assets operationalize this design system in code:
- Token source: `frontend/src/design/tokens.ts`
- Shadcn blueprint: `frontend/src/design/shadcn-blueprint.ts`
- Ranked component catalog: `docs/ui-component-catalog.md`
- Organized UI exports: `frontend/src/components/ui/index.ts`

Shadcn setup and first-wave imports were executed in the frontend workspace:
- `npx shadcn@latest init --defaults -c frontend`
- `npx shadcn@latest add -c frontend card input label alert badge tabs table textarea select dropdown-menu dialog sheet separator skeleton avatar`

## 10. Dashboard Ruleset
Use a priority stack for data-heavy screens:
1. Widgets and status cards first (situational awareness)
2. Action queues second (what needs operator action now)
3. Detail tables and drill-down panes third

Rules:
- Keep top-of-page KPI cards visible without scrolling on desktop.
- Use no more than 4 primary status cards in a row before wrapping.
- Always include loading, empty, and error states for cards and tables.
- Keep alert severity visually distinct: info, warning, critical.

## 11. Commerce Ruleset (Cart, Checkout, Product)
### Cart
- Use both compact cart panel and full cart page.
- Panel is for quick adjustments; page is for full review and cross-sell context.

### Checkout
- Prefer a stable two-column structure on desktop: form on left, order summary on right.
- Critical trust signals (delivery certainty, payment safety, return policy) must remain visible.
- Validation should be inline and immediate, without collapsing the form context.

### Product Listing and Product Detail
- Listing pages use faceted filtering and sortable result grids.
- Product detail pages should include: media, specs, lead time, fulfillment notes, and action rail.
- Action rail should remain visible on long-scroll product descriptions.

## 12. Community Ruleset (Forum, DMs, Groups)
### Forum
- Prioritize readability and moderation controls over decorative UI.
- Thread cards should surface title, tags, activity, and unresolved status.

### Chat Rooms (Private and Group)
- Keep message composer persistent and clear.
- Distinguish system messages, moderation notices, and user content with clear visual hierarchy.
- Use notification and alert patterns for mentions, moderation actions, and delivery failures.

## 13. Settings and Profile Ruleset
- Use grouped form sections with clear headings and short descriptions.
- Keep security and danger-zone actions visually separated from standard preferences.
- Use confirmation dialogs for destructive or account-level irreversible actions.
- Preserve explicit save feedback (success, failure, pending).

## 14. Modal and Overlay Hierarchy
Modal priority model:
1. Critical modal dialogs (destructive confirmation, irreversible actions)
2. Operational dialogs (approve/reject flows, assignment actions)
3. Secondary overlays (sheets, popovers, tooltip helpers)

Rules:
- Do not stack multiple primary modals.
- Every dialog must have clear title, intent, and explicit close path.
- Toasts are for lightweight feedback, not for high-risk decisions.

## 15. Sidebar, Alerts, and Notification Rules
### Sidebar
- Sidebar IA should be shallow, role-oriented, and action-focused.
- Keep 5 to 7 primary nav items maximum per role workspace.

### Alerts and Notifications
- Alerts should map to action urgency:
  - Informational: no immediate action required
  - Warning: action soon
  - Critical: action now
- Notification cards should include event source, timestamp, and direct action CTA when possible.

## 16. Component Selection Process Rules
- Shadcn is baseline infrastructure for accessibility and composability.
- External component kits are acceptable for targeted gains, but must be token-aligned and behavior-audited.
- Prefer incremental adoption route-by-route rather than broad rewrites.
- Before introducing new third-party blocks, document feature mapping and replacement risk in `docs/ui-component-catalog.md`.