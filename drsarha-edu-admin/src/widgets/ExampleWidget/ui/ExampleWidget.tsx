'use client';
import { FC } from 'react';
import { cvaRoot } from './ExampleWidgetStyles';

interface Props {}

const ExampleWidget: FC<Props> = () => {
  return <div className={cvaRoot()}></div>;
};

export default ExampleWidget;
