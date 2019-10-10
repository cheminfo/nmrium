import React from 'react';

import FunctionToolBar, { options } from './FunctionToolBar';
import HistoryToolBar from './HistoryToolBar';
import BasicToolBar from './BasicToolBar';
import ViewButton from './ViewButton';


const styles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
};
const ToolBar = () => {
  return (
    <div css={styles}>
      <FunctionToolBar defaultValue={options.zoom.id} />
      <HistoryToolBar />
      <BasicToolBar />
      <ViewButton defaultValue={true} />
    </div>
  );
};

export default ToolBar;
