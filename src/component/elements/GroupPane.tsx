import { CSSProperties, ReactNode } from 'react';

const styles: Record<'header', CSSProperties> = {
  header: {
    fontSize: '13px',
    color: '#2ca8ff',
    marginBottom: '10px',
    borderBottom: '0.55px solid #f9f9f9',
    padding: '6px 2px',
  },
};

export interface GroupPaneStyle {
  header?: CSSProperties;
  container?: CSSProperties;
}

interface GroupPaneProps {
  text: string;
  style?: GroupPaneStyle;
  children: ReactNode;
  renderHeader?: (text: string) => ReactNode;
}

export function GroupPane(props: GroupPaneProps) {
  const { text, style, children, renderHeader } = props;

  return (
    <div style={style?.container}>
      {!renderHeader ? (
        <p style={{ ...styles.header, ...style?.header }}>{text}</p>
      ) : (
        renderHeader(text)
      )}
      {children}
    </div>
  );
}
