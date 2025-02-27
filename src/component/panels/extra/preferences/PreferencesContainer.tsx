import type { CSSProperties, ReactNode } from 'react';

interface PreferencesContainerProps {
  children: ReactNode;
  style?: CSSProperties;
}

const containerStyle: CSSProperties = {
  padding: 10,
  backgroundColor: '#f1f1f1',
  height: '100%',
  overflowY: 'auto',
};

export function PreferencesContainer({
  children,
  style,
}: PreferencesContainerProps) {
  return <div style={{ ...containerStyle, ...style }}>{children}</div>;
}
