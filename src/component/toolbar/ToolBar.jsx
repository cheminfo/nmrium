import React from 'react';

import { useChartData } from '../context/ChartContext';

import FunctionToolBar from './FunctionToolBar';
import HistoryToolBar from './HistoryToolBar';
import BasicToolBar from './BasicToolBar';
import ViewButton from './ViewButton';
import FiltersToolBar from './FiltersToolBar';

const styles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
};
const ToolBar = () => {
  const { selectedTool } = useChartData();
  return (
    <div style={styles}>
      <FunctionToolBar defaultValue={selectedTool} />
      <FiltersToolBar />
      <HistoryToolBar />
      <BasicToolBar />
      <ViewButton defaultValue={true} />
    </div>
  );
};

export default ToolBar;
