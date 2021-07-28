import { memo } from 'react';

import { useChartData } from '../../context/ChartContext';

import MultiplicityTree from './MultiplicityTree';

interface TempMultiplicityTreeInnerProps {
  range: any;
}

function TempMultiplicityTreeInner({ range }: TempMultiplicityTreeInnerProps) {
  return (
    range?.signals &&
    range.signals.length > 0 &&
    range.signals.map((signal) => (
      <MultiplicityTree
        rangeFrom={range.from}
        rangeTo={range.to}
        signal={signal}
        key={signal.id}
      />
    ))
  );
}

const MemoizedTempMultiplicityTree = memo(TempMultiplicityTreeInner);

export default function TempMultiplicityTree() {
  const {
    toolOptions: {
      data: { tempRange },
    },
  } = useChartData();

  return <MemoizedTempMultiplicityTree range={tempRange} />;
}
