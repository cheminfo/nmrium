import { CSSProperties, memo } from 'react';

import { useChartData } from '../context/ChartContext';

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

interface ToolBarInnerProps {
  selectedTool: string;
}

function ToolBarInner({ selectedTool }: ToolBarInnerProps) {
  return (
    <div style={styles}>
      <FunctionToolBar defaultValue={selectedTool} />
      {/* <HistoryToolBar /> */}
      <BasicToolBar />
    </div>
  );
}

const MemoizedToolBar = memo(ToolBarInner);

export default function ToolBar() {
  const {
    toolOptions: { selectedTool },
  } = useChartData();

  return <MemoizedToolBar {...{ selectedTool }} />;
}
