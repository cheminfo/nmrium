import type { CSSProperties, ReactNode } from 'react';

const containerStyle: CSSProperties = {
  display: 'flex',
};

interface HeaderContainerProps {
  style?: CSSProperties;
  children: ReactNode;
}

export function HeaderWrapper(props: HeaderContainerProps) {
  const { style = {}, children } = props;
  return <div style={{ ...containerStyle, ...style }}>{children}</div>;
}
