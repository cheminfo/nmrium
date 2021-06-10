import { CSSProperties, memo } from 'react';

import BasicToolBar from './BasicToolBar';
import FunctionToolBar from './FunctionToolBar';

const styles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  borderRight: '0.55px solid #f7f7f7',
  paddingRight: '1px',
  overflowY: 'auto',
  height: '100%',
};

interface ToolBarProps {
  selectedTool: string;
}

function ToolBar({ selectedTool }: ToolBarProps) {
  return (
    <div style={styles}>
      <FunctionToolBar defaultValue={selectedTool} />
      {/* <HistoryToolBar /> */}
      <BasicToolBar />
    </div>
  );
}

export default memo(ToolBar);
