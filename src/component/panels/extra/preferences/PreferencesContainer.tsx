import React, { CSSProperties } from 'react';

interface PreferencesContainerProps {
  children: React.ReactNode;
}

const style: CSSProperties = {
  padding: 10,
  backgroundColor: '#f1f1f1',
  height: '100%',
  overflowY: 'auto',
};

export function PreferencesContainer({ children }: PreferencesContainerProps) {
  return <div style={style}>{children}</div>;
}
