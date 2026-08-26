export type DynamicLightingMode =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'lateNight';

export type DynamicLightingTheme = {
  mode: DynamicLightingMode;

  background: string;
  elevatedBackground: string;
  ambientSurface: string;

  topGlow: string;
  bottomGlow: string;

  primaryText: string;
  secondaryText: string;
  mutedText: string;

  neutralBorder: string;
  subtleBorder: string;

  greenAccent: string;
  greenSoft: string;

  statusBarStyle:
    | 'light'
    | 'dark';
};

const signatureGreen = '#9EF65A';

const themes: Record<
  DynamicLightingMode,
  DynamicLightingTheme
> = {
  morning: {
    mode: 'morning',

    background: '#080C09',
    elevatedBackground: '#101612',
    ambientSurface: '#141B16',

    topGlow:
      'rgba(255, 246, 218, 0.045)',

    bottomGlow:
      'rgba(158, 246, 90, 0.018)',

    primaryText: '#FAFCFA',
    secondaryText: '#C5CAC6',
    mutedText: '#858C87',

    neutralBorder:
      'rgba(255, 255, 255, 0.095)',

    subtleBorder:
      'rgba(255, 255, 255, 0.055)',

    greenAccent: signatureGreen,

    greenSoft:
      'rgba(158, 246, 90, 0.075)',

    statusBarStyle: 'light',
  },

  afternoon: {
    mode: 'afternoon',

    background: '#070A08',
    elevatedBackground: '#0F1411',
    ambientSurface: '#131915',

    topGlow:
      'rgba(255, 255, 255, 0.025)',

    bottomGlow:
      'rgba(158, 246, 90, 0.018)',

    primaryText: '#FFFFFF',
    secondaryText: '#C1C7C2',
    mutedText: '#7F8781',

    neutralBorder:
      'rgba(255, 255, 255, 0.09)',

    subtleBorder:
      'rgba(255, 255, 255, 0.05)',

    greenAccent: signatureGreen,

    greenSoft:
      'rgba(158, 246, 90, 0.07)',

    statusBarStyle: 'light',
  },

  evening: {
    mode: 'evening',

    background: '#050806',
    elevatedBackground: '#0D120F',
    ambientSurface: '#111713',

    topGlow:
      'rgba(126, 167, 126, 0.035)',

    bottomGlow:
      'rgba(158, 246, 90, 0.015)',

    primaryText: '#FBFCFB',
    secondaryText: '#B9C0BA',
    mutedText: '#788079',

    neutralBorder:
      'rgba(255, 255, 255, 0.08)',

    subtleBorder:
      'rgba(255, 255, 255, 0.045)',

    greenAccent: signatureGreen,

    greenSoft:
      'rgba(158, 246, 90, 0.065)',

    statusBarStyle: 'light',
  },

  lateNight: {
    mode: 'lateNight',

    background: '#030504',
    elevatedBackground: '#0A0E0C',
    ambientSurface: '#0D120F',

    topGlow:
      'rgba(126, 167, 126, 0.018)',

    bottomGlow:
      'rgba(158, 246, 90, 0.01)',

    primaryText: '#F1F3F1',
    secondaryText: '#A8AEA9',
    mutedText: '#6C736D',

    neutralBorder:
      'rgba(255, 255, 255, 0.07)',

    subtleBorder:
      'rgba(255, 255, 255, 0.038)',

    greenAccent: signatureGreen,

    greenSoft:
      'rgba(158, 246, 90, 0.05)',

    statusBarStyle: 'light',
  },
};

export function getDynamicLightingMode(
  date: Date = new Date(),
): DynamicLightingMode {
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) {
    return 'morning';
  }

  if (hour >= 11 && hour < 17) {
    return 'afternoon';
  }

  if (hour >= 17 && hour < 22) {
    return 'evening';
  }

  return 'lateNight';
}

export function getDynamicLightingTheme(
  date: Date = new Date(),
): DynamicLightingTheme {
  const mode =
    getDynamicLightingMode(date);

  return themes[mode];
}

export const visualHierarchy = {
  greenUsage: {
    primaryAction: signatureGreen,
    activeState: signatureGreen,
    trustSignal: signatureGreen,
    verification: signatureGreen,

    decorative:
      'rgba(255, 255, 255, 0)',
  },

  text: {
    heading: '#FFFFFF',
    subheading: '#E5E8E5',
    body: '#B7BDB8',
    supporting: '#7E8680',
  },

  border: {
    standard:
      'rgba(255, 255, 255, 0.08)',

    soft:
      'rgba(255, 255, 255, 0.045)',

    selected:
      'rgba(158, 246, 90, 0.32)',
  },
} as const;