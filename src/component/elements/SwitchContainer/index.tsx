/** @jsxImportSource @emotion/react */
import { ReactElement, ReactFragment } from 'react';

import { tablePanelStyle } from '../../panels/extra/BasicPanelStyle';

import {
  SwitchContainerProvider,
  SwitchContext,
  useSwitchContext,
} from './SwitchContainerContext';

type InnerChildren =
  | ReactElement<any>
  | ((state: SwitchContext) => ReactElement<any>);

type ChildrenNodes =
  | ReactElement<any>
  | Array<ReactElement<any>>
  | ReactFragment
  | boolean
  | null;

export function SwitchContainer(props: { children: ChildrenNodes }) {
  return (
    <SwitchContainerProvider>
      <div css={tablePanelStyle}>{props.children}</div>
    </SwitchContainerProvider>
  );
}

SwitchContainer.Front = function FrontContainer(props: {
  children: InnerChildren;
}) {
  return <ContainerItem flag={false}>{props.children}</ContainerItem>;
};
SwitchContainer.Back = function BackContainer(props: {
  children: InnerChildren;
}) {
  return <ContainerItem flag>{props.children}</ContainerItem>;
};

function ContainerItem(props: { children: InnerChildren; flag: boolean }) {
  const context = useSwitchContext();
  return context.isFlipped === props.flag
    ? typeof props.children === 'function'
      ? props.children?.(context)
      : props.children
    : null;
}
