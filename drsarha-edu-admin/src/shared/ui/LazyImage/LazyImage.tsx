import clsx from 'clsx';
import Image from 'next/image';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { cvaImage, cvaImageWrap } from './LazyImageStyles';

interface ILazyImageProps {
  fill?: boolean;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  delay?: number;
  quality?: number;
  imageWrapClass?: string;
  imageRatio?: string;
}

export const LazyImage = ({
  quality = 90,
  alt,
  src,
  fill,
  width,
  height,
  className,
  loading = 'lazy',
  priority = false,
  delay = 0,
  imageRatio,
  imageWrapClass,
}: ILazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const { ref: imageWrapRef, inView } = useInView({
    triggerOnce: true,
    threshold: [0.1, 0.1, 0.1, 0.1],
  });

  return (
    <div
      className={clsx(
        cvaImageWrap({ type: fill ? 'absolute' : 'relative' }),
        imageWrapClass
      )}
      ref={imageWrapRef}>
      <Image
        quality={quality}
        loading={loading}
        priority={priority}
        className={clsx(
          cvaImage({
            state: isLoaded && inView ? 'loaded' : 'default',
          }),
          className
        )}
        style={{ transitionDelay: `${delay}s`, aspectRatio: imageRatio }}
        src={src}
        width={width}
        height={height}
        fill={fill}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};
