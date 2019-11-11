import React from 'react';

import FunctionToolBar from './FunctionToolBar';
import { options } from './ToolTypes';
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
  return (
    <div style={styles}>
      <FunctionToolBar defaultValue={options.zoom.id} />
      <FiltersToolBar />
      <HistoryToolBar />
      <BasicToolBar />
      <ViewButton defaultValue={true} />
    </div>
  );
};

export default ToolBar;
