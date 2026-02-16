import { FC } from 'react';
import { remResize } from '@/features/rem-resize/utils/remResize';

export const RemResizeScript: FC<Parameters<typeof remResize>[0]> = (props) => {
  return (
    <script
      data-cfasync="false"
      id="rem-resize"
      dangerouslySetInnerHTML={{
        __html: `
          (${remResize.toString()})(${JSON.stringify(props)});
          window.addEventListener('resize', () => (${remResize.toString()})(${JSON.stringify(props)}))
        `,
      }}
    />
  );
};
