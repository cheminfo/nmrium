import { Toolbar } from 'analysis-ui-components';
import { memo } from 'react';

import { useChartData } from '../context/ChartContext';

import BasicToolBar from './BasicToolBar';
import FunctionToolBar from './FunctionToolBar';

interface ToolBarInnerProps {
  selectedTool: string;
}

function ToolBarInner({ selectedTool }: ToolBarInnerProps) {
  return (
    <Toolbar orientation="vertical">
      <FunctionToolBar defaultValue={selectedTool} />
      {/* <HistoryToolBar /> */}
      <BasicToolBar />
    </Toolbar>
  );
}

const MemoizedToolBar = memo(ToolBarInner);

export default function ToolBar() {
  const {
    toolOptions: { selectedTool },
  } = useChartData();

  return <MemoizedToolBar {...{ selectedTool }} />;
}
