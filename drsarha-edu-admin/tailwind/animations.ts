import { EASE } from '../src/shared/animations/easings';
import { CustomThemeConfig } from 'tailwindcss/types/config';

export const animations: CustomThemeConfig['extend'] = {
  keyframes: {
    marquee: {
      '0%': { transform: 'translateX(0)' },
      '100%': { transform: 'translateX(-50%)' },
    },
  },
  animation: {
    marquee: 'marquee 6s linear infinite',
  },
  transitionTimingFunction: {
    linear: EASE.linear,
  },
  transitionDuration: {
    400: '400ms',
    1000: '1000ms',
    1100: '1100ms',
    1200: '1200ms',
    1300: '1300ms',
  },
  transitionDelay: {
    1000: '1000ms',
    1100: '1100ms',
    1200: '1200ms',
  },
};
