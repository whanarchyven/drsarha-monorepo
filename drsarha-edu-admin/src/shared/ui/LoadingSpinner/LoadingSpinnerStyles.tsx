import { cva } from 'class-variance-authority';

export const cvaLoading = cva(
  [
    'LoadingSpinnerStyles-cvaLoading',
    'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2]',
  ],
  {
    variants: {
      size: {
        xs: ['w-1.8 h-1.8'],
        sm: ['w-2.4 h-2.4'],
        md: ['w-3.2 h-3.2'],
        lg: ['w-3.6 h-3.6'],
        xl: ['w-5 h-5'],
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export const cvaCircle = cva(
  [
    'LoadingSpinnerStyles-cvaCircle',
    'absolute',
    'w-[40%] h-[40%]',
    'm-0',
    'animate-loading-spin child-1:animation-delay-n1.5 child-2:animation-delay-n1 child-3:animation-delay-n0.5',
    'border-none rounded-full',
  ],
  {
    variants: {
      color: {
        black: ['bg-black'],
        white: ['bg-white'],
      },
    },
    defaultVariants: {
      color: 'black',
    },
  }
);
