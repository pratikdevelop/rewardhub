import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN = { width, height };

export const COLORS = {
  // Core backgrounds
  bg:         '#0D0B1E',
  bgCard:     '#1A1535',
  bgCardAlt:  '#231B45',
  bgInput:    '#2A1D4A',
  bgOverlay:  'rgba(13,11,30,0.95)',

  // Brand
  primary:     '#9B6DFF',
  primaryDark: '#7B4FE0',
  primaryGlow: 'rgba(155,109,255,0.3)',

  // Gold / coins
  gold:        '#FFD700',
  goldLight:   '#FFE55C',
  goldDark:    '#E6B800',
  goldGlow:    'rgba(255,215,0,0.25)',

  // Game card colors (neon palette)
  spin:        '#00E676',
  spinGlow:    'rgba(0,230,118,0.3)',
  spinDark:    '#00C853',

  scratch:     '#E040FB',
  scratchGlow: 'rgba(224,64,251,0.3)',
  scratchDark: '#AA00FF',

  captcha:     '#40C4FF',
  captchaGlow: 'rgba(64,196,255,0.3)',
  captchaDark: '#0091EA',

  quiz:        '#FF5252',
  quizGlow:    'rgba(255,82,82,0.3)',
  quizDark:    '#D50000',

  lucky:       '#00E5FF',
  luckyGlow:   'rgba(0,229,255,0.3)',
  luckyDark:   '#00B8D4',

  refer:       '#FFAB40',
  referGlow:   'rgba(255,171,64,0.3)',
  referDark:   '#FF6D00',

  // Text
  white:      '#FFFFFF',
  textMuted:  'rgba(255,255,255,0.6)',
  textHint:   'rgba(255,255,255,0.3)',

  // Semantic
  success:    '#00E676',
  error:      '#FF5252',
  warning:    '#FFD700',

  // Borders
  border:     'rgba(155,109,255,0.2)',
  borderGold: 'rgba(255,215,0,0.35)',
} as const;

export const SIZES = {
  xs:   10,
  sm:   12,
  md:   14,
  lg:   16,
  xl:   20,
  xxl:  26,
  xxxl: 32,
} as const;

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   18,
  xl:   24,
  xxl:  32,
  full: 999,
} as const;

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 40,
} as const;

// Neon glow shadow (iOS + Android compatible)
export function glowShadow(color: string, intensity = 1) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8 * intensity,
    shadowRadius: 12 * intensity,
    elevation: 12 * intensity,
  };
}