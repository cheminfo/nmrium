import { CSSProperties } from 'react';

const style: CSSProperties = {
  textAlign: 'center',
  width: '100%',
  fontSize: '11px',
  padding: '5px',
  color: 'gray',
};

// placeholder for empty tables if no data is available to show (e.g. peaks, integrals, ranges)
function NoTableData() {
  return <p style={style}>No Data</p>;
}

export default NoTableData;
