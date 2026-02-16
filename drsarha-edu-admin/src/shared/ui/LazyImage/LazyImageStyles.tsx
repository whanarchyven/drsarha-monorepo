import { cva } from 'class-variance-authority';

export const cvaImageWrap = cva(
  [
    'LazyImageStyles-cvaImageWrap',
    'overflow-hidden [backface-visibility:hidden]',
  ],
  {
    variants: {
      type: {
        relative: ['inline-block'],
        absolute: ['absolute inset-0'],
      },
    },
  }
);

export const cvaImage = cva(
  [
    'LazyImageStyles-cvaImage',
    'transition-all duration-300 ease-in-out [backface-visibility:hidden]',
  ],
  {
    variants: {
      state: {
        default: ['opacity-0'],
        loaded: ['opacity-1'],
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);
