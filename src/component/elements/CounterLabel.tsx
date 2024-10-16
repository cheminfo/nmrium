import type { CSSProperties } from 'react';

const labelStyle: CSSProperties = {
  margin: 0,
  textAlign: 'right',
  padding: '0 5px',
  whiteSpace: 'nowrap',
};

interface CounterLabelProps {
  style?: CSSProperties;
  value?: string;
}

export function CounterLabel(props: CounterLabelProps) {
  const { style = {}, value } = props;

  return value && <p style={{ ...labelStyle, ...style }}>{value} </p>;
}
