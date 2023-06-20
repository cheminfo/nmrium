import { CSSProperties, ReactNode } from 'react';

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  borderBottom: '0.55px solid rgb(240 240 240)',
  padding: '2px 5px',
  alignItems: 'center',
};

interface PanelHeaderProps {
  style?: CSSProperties;
  children: ReactNode;
}

export default function PanelHeader(props: PanelHeaderProps) {
  const { style = {}, children } = props;

  return <div style={{ ...containerStyle, ...style }}>{children} </div>;
}
