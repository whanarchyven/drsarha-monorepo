'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface IPortalProps {
  children: ReactNode;
  className?: string;
}

export const Portal: FC<IPortalProps> = ({ children }) => {
  const [container] = useState(() => {
    const el = document.createElement('div');
    return el;
  });

  useEffect(() => {
    document.body.appendChild(container);

    return () => {
      try {
        document.body.removeChild(container);
      } catch (e) {
        console.warn(e);
      }
    };
  }, []);

  return createPortal(children, container);
};
