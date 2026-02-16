import gsap from 'gsap';

const linear = [0, 0, 1, 1];

const cssEase = (ease: number[]) => `cubic-bezier(${ease.join(', ')})`;
const animeEase = (ease: number[]) => `cubicBezier(${ease.join(', ')})`;
const gsapEase = (ease: number[]) =>
  gsap.parseEase(`cubic-bezier(${ease.join(', ')})`);

export const EASE = {
  linear: cssEase(linear),
  gsap: {
    linear: gsapEase(linear),
  },
  anime: {
    linear: animeEase(linear),
  },
  framer: {
    linear,
  },
};
