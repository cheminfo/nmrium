import React from 'react';

import { useChartData } from '../context/ChartContext';

import FunctionToolBar from './FunctionToolBar';
// import HistoryToolBar from './HistoryToolBar';
import BasicToolBar from './BasicToolBar';

const styles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  borderRight: '0.55px solid #f7f7f7',
  paddingRight: '1px',
};
const ToolBar = ({ preferences }) => {
  const { selectedTool } = useChartData();
  return (
    <div style={styles}>
      <FunctionToolBar defaultValue={selectedTool} preferences={preferences} />
      {/* <HistoryToolBar /> */}
      <BasicToolBar preferences={preferences} />
    </div>
  );
};

export default ToolBar;
