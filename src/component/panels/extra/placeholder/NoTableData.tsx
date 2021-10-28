import { CSSProperties } from 'react';

const styles: Record<'label' | 'container', CSSProperties> = {
  container: {
    height: '100%',
    backgroundColor: 'white',
  },
  label: {
    textAlign: 'center',
    width: '100%',
    fontSize: '11px',
    padding: '5px',
    color: 'gray',
  },
};

// placeholder for empty tables if no data is available to show (e.g. peaks, integrals, ranges)
function NoTableData() {
  return (
    <div style={styles.container}>
      <p style={styles.label}>No Data</p>
    </div>
  );
}

export default NoTableData;
