export const colors = {
  background: '#0A0A0F',
  surface: '#14141C',
  surfaceElevated: '#1C1C28',
  surfaceHighlight: '#242433',
  border: '#2E2E3E',
  borderFocus: '#7C6FF7',
  primary: '#7C6FF7',
  primaryPressed: '#6B5EE6',
  primaryMuted: 'rgba(124, 111, 247, 0.15)',
  textPrimary: '#F4F4F5',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textInverse: '#0A0A0F',
  error: '#F87171',
  errorMuted: 'rgba(248, 113, 113, 0.12)',
  success: '#34D399',
  overlay: 'rgba(0, 0, 0, 0.6)',
  tabInactive: '#71717A',
  tabActive: '#7C6FF7',
} as const;

export type ColorKey = keyof typeof colors;
