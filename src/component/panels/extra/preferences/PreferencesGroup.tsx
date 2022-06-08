import React, { CSSProperties } from 'react';

interface PreferencesGroupProps {
  children: React.ReactNode[];
  header?: ((style: CSSProperties) => React.ReactNode) | string;
}

const styles = {
  groupContainer: {
    padding: '5px',
    borderRadius: '5px',
    margin: '10px 0px',
    backgroundColor: 'white',
  },
  header: {
    borderBottom: '1px solid #e8e8e8',
    paddingBottom: '5px',
    fontWeight: 'bold',
    color: '#4a4a4a',
    marginBottom: '10px',
    fontSize: '12px',
  },
};

export function PreferencesGroup({ children, header }: PreferencesGroupProps) {
  return (
    <div style={styles.groupContainer}>
      {header &&
        (typeof header === 'string' ? (
          <p style={styles.header}>{header}</p>
        ) : (
          header(styles.header)
        ))}
      {children}
    </div>
  );
}
