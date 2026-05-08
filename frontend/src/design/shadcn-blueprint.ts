import { dfnTokens } from './tokens';

export type DfnRouteBlueprint = {
  route: string;
  purpose: string;
  layout: {
    shell: string;
    sections: string[];
  };
  shadcnComponents: string[];
  interactionModel: string[];
  notes: string[];
};

export const scopedRouteBlueprints: DfnRouteBlueprint[] = [
  {
    route: '/',
    purpose: 'Landing and network positioning',
    layout: {
      shell: 'Hero + alternating feature bands + trust metrics + final CTA',
      sections: ['hero', 'metrics', 'services', 'ecosystem-pillars', 'testimonials', 'cta'],
    },
    shadcnComponents: ['button', 'card', 'badge', 'separator'],
    interactionModel: [
      'Staggered reveal on hero copy and card groups',
      'Subtle card lift on hover only for actionable blocks',
      'Primary CTA uses gradient and medium elevation',
    ],
    notes: [
      'Keep copy scannable with strong heading hierarchy',
      'Prefer semantic backgrounds over ad-hoc color utilities',
    ],
  },
  {
    route: '/stakeholders',
    purpose: 'Explain ecosystem role groups and participation value',
    layout: {
      shell: 'Editorial hero + role-based bento cards + CTA closure',
      sections: ['hero', 'stakeholder-pillars', 'supporting-metrics', 'cta'],
    },
    shadcnComponents: ['card', 'badge', 'button', 'separator'],
    interactionModel: [
      'Role cards include compact metadata chips and outcomes',
      'Use contrast sections to separate strategic content bands',
    ],
    notes: [
      'Role taxonomy should remain stable across navigation and content labels',
    ],
  },
  {
    route: '/prototyping',
    purpose: 'Show fabrication capability and technical credibility',
    layout: {
      shell: 'Capability hero + service matrix + mentorship block + conversion CTA',
      sections: ['hero', 'fabrication-suite', 'mentorship', 'network-reach', 'cta'],
    },
    shadcnComponents: ['card', 'badge', 'button', 'tabs', 'separator'],
    interactionModel: [
      'Service matrix supports scan-first reading with icon and short body',
      'Maintain low-friction CTA with one primary action and one fallback',
    ],
    notes: [
      'Avoid over-animating technical sections that need fast comprehension',
    ],
  },
  {
    route: '/manifesto',
    purpose: 'Long-form mission narrative and policy stance',
    layout: {
      shell: 'Narrative lead + section anchors + quote blocks + action footer',
      sections: ['intro', 'principles', 'commitments', 'ecosystem-calls', 'cta'],
    },
    shadcnComponents: ['card', 'badge', 'separator', 'button'],
    interactionModel: [
      'Use restrained motion and stronger typography hierarchy',
      'Preserve reading rhythm with consistent width and section spacing',
    ],
    notes: [
      'Add scroll spy pattern in a later wave when blog module is stable',
    ],
  },
];

export const adminBlueprint: DfnRouteBlueprint = {
  route: '/admin/*',
  purpose: 'Operational control for users, providers, verifications, and content',
  layout: {
    shell: 'Sidebar + header widgets + tabular work areas',
    sections: ['overview', 'users', 'providers', 'verifications', 'content'],
  },
  shadcnComponents: [
    'sidebar',
    'card',
    'badge',
    'table',
    'tabs',
    'dialog',
    'sheet',
    'alert',
    'dropdown-menu',
    'separator',
  ],
  interactionModel: [
    'Primary actions in table rows should be explicit and reversible where possible',
    'Approval and rejection actions should always show confirmation context',
    'Status cards and widgets remain above fold for operator situational awareness',
  ],
  notes: [
    'Notification cards and alerts are first-class in moderation-heavy screens',
    'Use compact list density with clear empty/loading/error states',
  ],
};

export const authBlueprint: DfnRouteBlueprint = {
  route: '/auth/*',
  purpose: 'Trustworthy account entry and onboarding handoff',
  layout: {
    shell: 'Single-focus auth card on atmospheric but restrained background',
    sections: ['credential-form', 'social-auth', 'validation-feedback', 'help-links'],
  },
  shadcnComponents: ['card', 'button', 'input', 'label', 'alert', 'separator'],
  interactionModel: [
    'Inline validation should appear progressively without layout jump',
    'Primary submit action is always visually dominant and keyboard accessible',
  ],
  notes: [
    'Password guidance should be explicit and measurable',
    'Do not hide critical auth paths behind modal-only flows',
  ],
};

export const blogBlueprint: DfnRouteBlueprint = {
  route: '/blog',
  purpose: 'Editorial publishing and discoverability for DFN insights',
  layout: {
    shell: 'Featured story + category filters + article grid + newsletter CTA',
    sections: ['featured', 'filters', 'article-grid', 'cta'],
  },
  shadcnComponents: ['card', 'badge', 'button', 'input', 'separator'],
  interactionModel: [
    'Cards should support scan behavior with metadata and reading time',
    'Filtering controls should be lightweight and persistent within session scope',
  ],
  notes: [
    'Scroll spy and in-page navigation can be added in article detail route later',
  ],
};

export const blueprintMeta = {
  version: '1.0.0',
  tokenReference: dfnTokens,
  implementationOrder: [
    'authBlueprint',
    'adminBlueprint',
    'blogBlueprint',
    'scopedRouteBlueprints refinements',
  ],
};
