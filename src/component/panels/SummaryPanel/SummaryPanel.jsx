import React from 'react';

import CorrelationTable from './CorrelationTable';

const styles = {
  // toolbar: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   borderBottom: '0.55px solid rgb(240, 240, 240)',
  // },
  container: {
    flexDirection: 'column',
    height: '100%',
    display: 'flex',
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
};

const SummaryPanel = () => {
  return (
    <>
      <div style={styles.container}>
        <CorrelationTable />
      </div>
    </>
  );
};

export default SummaryPanel;
