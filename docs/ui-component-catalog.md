# DFN UI Component Catalog

This document normalizes and ranks raw component notes into an implementation-focused catalog for the Digital Fabrication Network.

## Scoring Model
- Product fit (1 to 5): How directly this serves DFN features.
- Delivery value (1 to 5): User and business impact if implemented.
- Complexity (1 to 5): Engineering/design complexity where 5 is hardest.
- Priority score: Product fit + Delivery value - Complexity.

## Priority Tiers
- P0: Build now in current wave.
- P1: Build next wave after auth/admin/blog stabilization.
- P2: Build later as capability expansion.

## P0 Components and Blocks

| Capability | Candidate | Primary DFN Surfaces | Why Now | Score | Source |
|---|---|---|---|---:|---|
| Data-heavy overview | Stat cards and KPI widgets | Admin overview, provider dashboard, ops dashboards | Critical for immediate admin overhaul and future dashboard consistency | 7 | shadcnuikit dashboard stat cards |
| Data management | Data table and data grid | Admin users, verifications, provider requests, payrolls | Required for operational pages and moderation tools | 7 | shadcn directory, diceui data table/grid |
| Navigation shell | Sidebar + page layout blocks | Admin multipage IA, settings, tools | Enables clean expansion from single admin page to structured admin suite | 7 | shadcnuikit page layouts |
| Forms baseline | Form layout and field composition | Login, signup, checkout, settings, onboarding | Needed for immediate auth remakes and checkout consistency | 7 | shadcnuikit form layout |
| Alerts and notifications | Notification stack and alert cards | Admin moderation, approvals, user feedback, status signals | Supports event-heavy workflows and user trust | 6 | diceui notification card stack |
| Modal system | Dialog, sheet, drawer, popovers | Cart panel, confirmations, inline edits, quick actions | Needed for cart panel plus modal rules in expanded design system | 6 | shadcn directory |
| Commerce flow | Shopping cart panel and cart page | Cart route and checkout funnel | Explicitly requested and required for blended quick cart + full cart model | 6 | shadcnuikit shopping cart blocks |
| Checkout system | Checkout block patterns | Checkout page and order finalization | Directly requested and high impact conversion surface | 6 | shadcnuikit checkout page blocks |

## P1 Components and Blocks

| Capability | Candidate | Primary DFN Surfaces | Why Next | Score | Source |
|---|---|---|---|---:|---|
| Onboarding UX | Multipage tour and guided steps | New users, first-time admins, provider onboarding | Valuable after IA stabilizes, avoids churn in flows under redesign | 5 | onboarding-tour multipage |
| Rich input controls | Combobox, multiselect, phone input, mask input, avatar select | Settings, profile, forms, admin filtering | Helps advanced forms and search workflows once baseline forms are complete | 5 | diceui controls |
| Upload and asset UX | File upload, files page, vault patterns | Projects, forum attachments, asset management | Important for production workflows but requires backend/storage alignment | 5 | diceui notes |
| Rating and feedback | Rating, key-value, gauge | Reviews, quality feedback, service benchmarking | Useful but depends on finalized reputation/product signals | 4 | diceui components |
| Scroll intelligence | Scroll spy | Blog and manifesto long-form reading | Useful for content readability once blog module ships | 4 | diceui scroll spy |
| Specialized map widgets | Logistics map components | Package tracking and delivery flow | Strong fit but depends on logistics API/UI maturity | 4 | mapcn.dev |

## P2 Components and Blocks

| Capability | Candidate | Primary DFN Surfaces | Why Later | Score | Source |
|---|---|---|---|---:|---|
| Motion accents | Text shimmer, signal bars loader, animated backgrounds, noise textures | Marketing sections and selective dashboard modules | Good polish layer after core usability and IA complete | 3 | elements, animate-ui, magicui, ui-layouts |
| Billing stack composition | Billing SDK blocks | Enterprise billing and org billing management | Requires product-level billing model decisions first | 3 | billingsdk + Clerk |
| Remotion demos | Video generation pipelines | Product demos and marketing media automation | Useful for growth content, not core product UX blocking | 2 | remotion |

## Feature-to-Component Mapping

### Public Narrative Surfaces
- Landing, stakeholders, prototyping, manifesto:
  - Hero blocks, feature cards, metrics cards, CTA bars, trust logos, quote blocks, long-form anchors.
  - Keep component count low and message clarity high.

### Auth and Identity
- Login, signup, onboarding:
  - Structured form cards, social auth buttons, validation messages, progressive disclosure.
  - Optional P1 additions: phone input and guided steps.

### Admin and Operations
- Admin overview, users, providers, verifications, content moderation:
  - Sidebar shell, widgets, status cards, sortable/filterable tables, row-level actions, review modals.

### Commerce
- Cart and checkout:
  - Sliding cart panel + full cart page dual mode.
  - Checkout with summary, address/payment forms, delivery options, confirmation step.

### Collaboration
- Forum and chat rooms:
  - Thread list, composer, reaction badges, pin state, moderation controls.
  - DMs/groups later can add presence indicators and media/file stacks.

### Project and Product Surfaces
- Product listing/detail pages:
  - Faceted filters, sortable grids, comparison cards, spec tabs, sticky action rail.

### Settings and Profile
- Account and org settings:
  - Form groups, danger zones, audit entries, notification preferences, role controls.

## Balance Rule (Shadcn + External)
- Use shadcn as baseline architecture for composability, accessibility, and maintainability.
- Use external blocks or animation kits only when they materially improve UX and can be aligned to DFN tokens.
- Never import large visual kits as-is without token adaptation and interaction audits.

## Initial Recommended Import Bundle
- button, input, label, card, badge
- alert, tabs, table, textarea, select
- dropdown-menu, dialog, sheet, separator
- skeleton, avatar

This bundle supports auth remakes, admin multipage overhaul, and initial blog build without overloading dependencies.