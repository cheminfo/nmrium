import React from 'react';

import BasicToolBar from './BasicToolBar';
import FunctionToolBar from './FunctionToolBar';
// import HistoryToolBar from './HistoryToolBar';

const styles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  borderRight: '0.55px solid #f7f7f7',
  paddingRight: '1px',
  overflowY: 'auto',
  height: '100%',
};
const ToolBar = ({ selectedTool }) => {
  return (
    <div style={{ ...styles }}>
      <FunctionToolBar defaultValue={selectedTool} />
      {/* <HistoryToolBar /> */}
      <BasicToolBar />
    </div>
  );
};

export default ToolBar;
