import { CSSProperties } from 'react';

const styles: Record<'container' | 'text', CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    userSelect: 'none',
    width: '100%',
    height: '100%',
    paddingLeft: '2em',
    paddingRight: '2em',
  },
  text: {
    padding: '1.2em 2em',
    backgroundColor: '#f7f7f7',
    borderRadius: '2em',
    color: '#2d2d2d',
    fontWeight: 'bold',
  },
};

interface PanelNoDataProps {
  children?: string;
}

export function PanelNoData({ children }: PanelNoDataProps) {
  return (
    <div style={styles.container}>
      <p style={styles.text}>{children}</p>
    </div>
  );
}
