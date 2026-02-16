import plugin from 'tailwindcss/plugin';

export const plugins = {
  plugins: [
    plugin(function ({ addVariant, addUtilities }) {
      addUtilities({
        '.absolute-center': {
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          top: '50%',
          left: '50%',
        },
        '.absolute-center-x': {
          position: 'absolute',
          transform: 'translateX(-50%)',
          left: '50%',
        },
        '.absolute-center-y': {
          position: 'absolute',
          transform: 'translateY(-50%)',
          top: '50%',
        },
      });
      addVariant('hocus', ['&:hover', '&:focus']),
        addVariant('inverted-colors', '@media (inverted-colors: inverted)'),
        addVariant('not-last', '&:not(:last-child)'),
        addVariant('not-first', '&:not(:first-child)'),
        addVariant('child-1', '&:nth-child(1)'),
        addVariant('child-2', '&:nth-child(2)'),
        addVariant('child-3', '&:nth-child(3)'),
        addVariant('child-4', '&:nth-child(4)'),
        addVariant('child-5', '&:nth-child(5)'),
        addVariant('child-6', '&:nth-child(6)'),
        addVariant('child-7', '&:nth-child(7)'),
        addVariant('child-8', '&:nth-child(8)'),
        addVariant('child-9', '&:nth-child(9)');
    }),
    require('tailwindcss-aspect-ratio'),
    require('tailwindcss-animation-delay'),
  ],
};
