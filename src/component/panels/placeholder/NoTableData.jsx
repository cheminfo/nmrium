import React from 'react';

// placeholder for empty tables if no data is available to show (e.g. peaks, integrals, ranges)
const NoTableData = () => {
  return (
    <p
      style={{
        textAlign: 'center',
        width: '100%',
        fontSize: '11px',
        padding: '5px',
        color: 'gray',
      }}
    >
      No Data
    </p>
  );
};
export default NoTableData;
