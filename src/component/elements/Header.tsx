import type { CSSProperties, ReactNode } from 'react';

interface HeaderProps {
  children: [ReactNode, ReactNode];
  style?: {
    leftStyle?: CSSProperties;
    rightStyle?: CSSProperties;
    containerStyle?: CSSProperties;
  };
}

const styles: Record<'header', CSSProperties> = {
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgb(247, 247, 247)',
    boxShadow: 'rgb(255, 255, 255) 0px 1px 0px 0px inset',
  },
};

export function Header(props: HeaderProps) {
  const {
    children,
    style: { leftStyle = {}, rightStyle = {}, containerStyle = {} } = {},
  } = props;
  return (
    <div style={{ ...styles.header, ...containerStyle }}>
      <div style={leftStyle}>{children[0]}</div>
      <div style={rightStyle}>{children[1]}</div>
    </div>
  );
}
