export const dfnTokens = {
  color: {
    brand: {
      forgeBlue: '#006098',
      horizonBlue: '#007ABF',
      deepFoundry: '#004873',
      signalTint: '#CEE5FF',
      signalInk: '#004A77',
      iceAccent: '#98CBFF',
    },
    ink: {
      primary: '#191C1E',
      secondary: '#475569',
      muted: '#64748B',
      inverse: '#FFFFFF',
    },
    surface: {
      canvas: '#F7F9FB',
      panel: '#F2F4F6',
      raised: '#FFFFFF',
      border: '#E6E8EA',
      dark: '#0F172A',
    },
    state: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#0284C7',
    },
  },
  gradient: {
    primaryAction: 'linear-gradient(180deg, #006098 0%, #007ABF 100%)',
    deepAction: 'linear-gradient(180deg, #006098 0%, #004873 100%)',
  },
  radius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    hero: '2rem',
    spotlight: '3rem',
  },
  shadow: {
    soft: '0 4px 20px rgba(2, 8, 23, 0.06)',
    medium: '0 12px 28px rgba(2, 8, 23, 0.12)',
    strong: '0 20px 40px rgba(2, 8, 23, 0.18)',
  },
  typography: {
    displayWeight: 900,
    sectionWeight: 800,
    bodyWeight: 500,
    overlineWeight: 700,
    tracking: {
      tight: '-0.03em',
      normal: '0',
      wide: '0.12em',
    },
    lineHeight: {
      display: 0.95,
      heading: 1.1,
      body: 1.6,
    },
  },
  spacing: {
    sectionY: '6rem',
    sectionYDense: '4rem',
    cardPadding: '2rem',
    cardGap: '1.5rem',
    contentMax: '80rem',
    contentWideMax: '87.5rem',
  },
  motion: {
    duration: {
      fast: 180,
      normal: 320,
      slow: 680,
    },
    easing: {
      standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
    patterns: {
      revealUp: 'translateY(24px) -> translateY(0)',
      cardLift: 'translateY(0) -> translateY(-4px)',
      ambientFloat: 'translateY(0) -> translateY(-8px) -> translateY(0)',
    },
  },
} as const;

export type DfnTokens = typeof dfnTokens;

export const dfnSemanticTokens = {
  page: {
    background: dfnTokens.color.surface.canvas,
    foreground: dfnTokens.color.ink.primary,
  },
  nav: {
    background: 'rgba(255,255,255,0.85)',
    border: dfnTokens.color.surface.border,
    active: dfnTokens.color.brand.forgeBlue,
  },
  card: {
    background: dfnTokens.color.surface.raised,
    border: dfnTokens.color.surface.border,
    radius: dfnTokens.radius.xl,
    shadow: dfnTokens.shadow.soft,
  },
  cta: {
    primaryBg: dfnTokens.gradient.primaryAction,
    primaryText: dfnTokens.color.ink.inverse,
    secondaryBg: dfnTokens.color.surface.panel,
    secondaryText: dfnTokens.color.brand.deepFoundry,
  },
  status: {
    success: dfnTokens.color.state.success,
    warning: dfnTokens.color.state.warning,
    error: dfnTokens.color.state.error,
    info: dfnTokens.color.state.info,
  },
} as const;
