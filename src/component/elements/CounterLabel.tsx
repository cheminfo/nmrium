import { CSSProperties, ReactNode } from 'react';

const labelStyle: CSSProperties = {
  margin: 0,
  textAlign: 'right',
  lineHeight: '22px',
  padding: '0 5px',
  whiteSpace: 'nowrap',
};

interface CounterLabelProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function CounterLabel(props: CounterLabelProps) {
  const { children, style = {} } = props;

  return <p style={{ ...labelStyle, ...style }}>{children}</p>;
}
