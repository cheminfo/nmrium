import React from 'react';
import FunctionToolBar, { options } from './FunctionToolBar';
import HistoryToolBar from './HistoryToolBar';
import BasicToolBar from './BasicToolBar';
import ViewButton from './ViewButton';

const ToolBar = () => {
  return (
    <div className="toolbar-container">
      <FunctionToolBar defaultValue={options.zoom.id} />
      <HistoryToolBar />
      <BasicToolBar />
      <ViewButton defaultValue={true} />
    </div>
  );
};

export default ToolBar;
