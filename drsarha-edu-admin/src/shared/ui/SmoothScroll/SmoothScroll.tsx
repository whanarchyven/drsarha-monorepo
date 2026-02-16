'use client';
import { FC, ReactNode, useEffect } from 'react';
import { Lenis as ReactLenis, useLenis } from '@studio-freight/react-lenis';

const options = {};

interface Props {
  children: ReactNode;
}

const SmoothScroll: FC<Props> = ({ children }) => {
  const lenis = useLenis();

  useEffect(() => {
    const pageLayout = document.querySelector('#app');

    if (pageLayout && lenis) {
      const resizeObserver = new ResizeObserver(() => {
        window.dispatchEvent(new Event('resize'));
        lenis.resize();
      });

      resizeObserver.observe(pageLayout);
    }
  }, [lenis]);

  return (
    <ReactLenis className={'lenis-container'} root options={{ ...options }}>
      {children}
    </ReactLenis>
  );
};

export default SmoothScroll;
