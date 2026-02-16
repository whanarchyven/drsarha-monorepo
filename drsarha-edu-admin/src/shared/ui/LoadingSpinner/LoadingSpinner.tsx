import { VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { FC } from 'react';
import { cvaCircle, cvaLoading } from './LoadingSpinnerStyles';

interface Props
  extends VariantProps<typeof cvaLoading>,
    VariantProps<typeof cvaCircle> {
  className?: string;
}

const LoadingSpinner: FC<Props> = ({ size, color, className }) => {
  return (
    <div className={clsx(cvaLoading({ size }), className)}>
      <hr className={cvaCircle({ color })} />
      <hr className={cvaCircle({ color })} />
      <hr className={cvaCircle({ color })} />
      <hr className={cvaCircle({ color })} />
    </div>
  );
};

export default LoadingSpinner;
