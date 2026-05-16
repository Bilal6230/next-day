import { TextStyle } from 'react-native';

import { colors } from './colors';

export const typography = {
  hero: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  } satisfies TextStyle,
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: colors.textPrimary,
  } satisfies TextStyle,
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.textPrimary,
  } satisfies TextStyle,
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textSecondary,
  } satisfies TextStyle,
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: colors.textMuted,
  } satisfies TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
  } satisfies TextStyle,
} as const;
