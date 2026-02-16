import { CustomThemeConfig } from 'tailwindcss/types/config';

export const typography: CustomThemeConfig['extend'] = {
  fontSize: {
    base: [
      '1.4rem',
      {
        lineHeight: '1',
      },
    ],
    0: [
      '0',
      {
        lineHeight: '0',
        letterSpacing: '0',
      },
    ],
  },
  lineHeight: {
    none: '1',
    normal: '1.5',
  },
  letterSpacing: {
    m01: '-0.01em',
    m02: '-0.02em',
    m03: '-0.03em',
    normal: '0',
    p01: '0.01em',
    p02: '0.01em',
    p03: '0.01em',
  },
  fontFamily: {
    base: 'var(--base-font)',
    secondary: 'var(--secondary-font)',
  },
};
