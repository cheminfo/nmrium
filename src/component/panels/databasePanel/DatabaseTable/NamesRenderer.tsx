import { CSSProperties } from 'react';

const style: CSSProperties = {
  whiteSpace: 'pre-line',
  textOverflow: 'ellipsis',
};

export default function NamesRenderer(props: { names: string[] }) {
  return <p style={style}>{props.names.join('\n')}</p>;
}
