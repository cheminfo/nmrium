import { memo } from 'react';
import { Toolbar } from 'react-science/ui';

import { useChartData } from '../context/ChartContext';
import { useStepByStepUserGuide } from '../elements/step-by-step-user-guide/index';

import BasicToolBar from './BasicToolBar';
import FunctionToolBar from './FunctionToolBar';

interface ToolBarInnerProps {
  selectedTool: string;
}

function ToolBarInner({ selectedTool }: ToolBarInnerProps) {
  const { registerStep } = useStepByStepUserGuide();
  return (
    <div ref={(element: any) => registerStep(element, 'toolbar')}>
      <Toolbar orientation="vertical">
        <FunctionToolBar defaultValue={selectedTool} />
        {/* <HistoryToolBar /> */}
        <BasicToolBar />
      </Toolbar>
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
