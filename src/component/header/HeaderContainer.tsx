import { CSSProperties } from 'react';

const style: CSSProperties = {
  padding: '5px',
  height: '100%',
  display: 'flex',
};

export function HeaderContainer(props) {
  return <div style={style}>{props.children}</div>;
}
