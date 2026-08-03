import type {
  TextStyle,
  ViewStyle,
} from 'react-native';

/*
 * DIRECT GAIN DESIGN SYSTEM V2
 *
 * This file contains the shared visual rules used across
 * Direct Gain. Components should use these tokens instead
 * of repeating raw numbers and colours.
 */

export const palette = {
  opportunityGreen: '#9EF65A',
  opportunityGreenBright: '#B7FF82',
  opportunityGreenDark: '#63C72C',

  midnight: '#070A07',
  midnightRaised: '#090D0A',

  slate900: '#0D110E',
  slate850: '#101511',
  slate800: '#131914',
  slate750: '#171D18',
  slate700: '#1D241E',

  snow: '#F7F9F7',
  cloud: '#DDE3DE',
  mist: '#A0AAA2',
  muted: '#778078',

  warning: '#FFCA5C',
  danger: '#FF7777',
  success: '#9EF65A',

  transparent: 'transparent',
} as const;

export const alpha = {
  green02: 'rgba(158, 246, 90, 0.02)',
  green04: 'rgba(158, 246, 90, 0.04)',
  green06: 'rgba(158, 246, 90, 0.06)',
  green08: 'rgba(158, 246, 90, 0.08)',
  green10: 'rgba(158, 246, 90, 0.10)',
  green12: 'rgba(158, 246, 90, 0.12)',
  green16: 'rgba(158, 246, 90, 0.16)',
  green20: 'rgba(158, 246, 90, 0.20)',
  green28: 'rgba(158, 246, 90, 0.28)',
  green40: 'rgba(158, 246, 90, 0.40)',

  white03: 'rgba(255, 255, 255, 0.03)',
  white05: 'rgba(255, 255, 255, 0.05)',
  white08: 'rgba(255, 255, 255, 0.08)',
  white10: 'rgba(255, 255, 255, 0.10)',
  white14: 'rgba(255, 255, 255, 0.14)',
  white04: 'rgba(255, 255, 255, 0.04)',
  
  black18: 'rgba(0, 0, 0, 0.18)',
  black28: 'rgba(0, 0, 0, 0.28)',
  black40: 'rgba(0, 0, 0, 0.40)',
  black56: 'rgba(0, 0, 0, 0.56)',
} as const;

export const spacing = {
  none: 0,
  xxxs: 2,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
} as const;

export const radius = {
  none: 0,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  card: 26,
  xxl: 30,
  pill: 999,
} as const;

export const iconSize = {
  xs: 14,
  sm: 17,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
} as const;

export const typography = {
  displayLarge: {
    fontSize: 42,
    lineHeight: 47,
    fontWeight: '900',
    letterSpacing: -1.4,
  } satisfies TextStyle,

  displayMedium: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: -1,
  } satisfies TextStyle,

  headingLarge: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: -0.7,
  } satisfies TextStyle,

  headingMedium: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.45,
  } satisfies TextStyle,

  headingSmall: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: -0.25,
  } satisfies TextStyle,

  bodyLarge: {
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '500',
  } satisfies TextStyle,

  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  } satisfies TextStyle,

  bodySmall: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  } satisfies TextStyle,

  labelLarge: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  } satisfies TextStyle,

  labelMedium: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 0.15,
  } satisfies TextStyle,

  eyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900',
    letterSpacing: 1.8,
  } satisfies TextStyle,
} as const;

export const border = {
  subtle: {
    borderWidth: 1,
    borderColor: alpha.white08,
  } satisfies ViewStyle,

  greenSubtle: {
    borderWidth: 1,
    borderColor: alpha.green10,
  } satisfies ViewStyle,

  greenMedium: {
    borderWidth: 1,
    borderColor: alpha.green20,
  } satisfies ViewStyle,

  greenStrong: {
    borderWidth: 1,
    borderColor: alpha.green40,
  } satisfies ViewStyle,
} as const;

export const shadow = {
  none: {
    shadowColor: '#000000',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 0,
  } satisfies ViewStyle,

  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  } satisfies ViewStyle,

  raised: {
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 11,
    },
    elevation: 10,
  } satisfies ViewStyle,

  greenSoft: {
    shadowColor: palette.opportunityGreen,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 4,
  } satisfies ViewStyle,

  greenMedium: {
    shadowColor: palette.opportunityGreen,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 7,
  } satisfies ViewStyle,

  greenStrong: {
    shadowColor: palette.opportunityGreen,
    shadowOpacity: 0.32,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 11,
  } satisfies ViewStyle,
} as const;

/*
 * Signature Direct Gain glow levels.
 *
 * soft:
 * Used on normal cards and decorative surfaces.
 *
 * medium:
 * Used on active controls and primary buttons.
 *
 * strong:
 * Reserved for success, achievements and live moments.
 */
export const glow = {
  soft: {
    backgroundColor: alpha.green04,
    borderColor: alpha.green10,
  },

  medium: {
    backgroundColor: alpha.green08,
    borderColor: alpha.green20,
  },

  strong: {
    backgroundColor: alpha.green12,
    borderColor: alpha.green40,
  },
} as const;

export const surface = {
  page: palette.midnight,

  navigation: palette.midnightRaised,

  card: palette.slate850,

  cardRaised: palette.slate800,

  cardSoft: palette.slate900,

  input: palette.slate800,

  overlay: alpha.black56,
} as const;

export const textColor = {
  primary: palette.snow,
  secondary: palette.mist,
  muted: palette.muted,
  accent: palette.opportunityGreen,
  inverse: palette.midnight,
  danger: palette.danger,
  warning: palette.warning,
} as const;

export const motion = {
  instant: 90,
  fast: 140,
  standard: 220,
  relaxed: 320,
  slow: 480,

  pressedScale: 0.985,
  iconPressedScale: 0.94,
  cardLift: -2,
} as const;

export const layout = {
  screenPadding: spacing.lg,
  cardPadding: 22,
  sectionGap: spacing.xxl,
  componentGap: spacing.md,
  bottomNavigationClearance: 150,
  maximumContentWidth: 720,
} as const;

export const designSystem = {
  palette,
  alpha,
  spacing,
  radius,
  iconSize,
  typography,
  border,
  shadow,
  glow,
  surface,
  textColor,
  motion,
  layout,
} as const;

export default designSystem;