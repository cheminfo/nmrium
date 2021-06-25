import { memo } from 'react';

import RangesWrapper from '../../hoc/RangesWrapper';

import Range, { RangeData } from './Range';

interface RangesProps {
  displayerKey: string;
  selectedTool: string;
  ranges: {
    values: Array<RangeData>;
  };
  editRangeID: string;
  showMultiplicityTrees: boolean;
}

function Ranges({
  ranges,
  displayerKey,
  selectedTool,
  editRangeID,
  showMultiplicityTrees,
}: RangesProps) {
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {ranges?.values?.map((range) => (
        <Range
          key={range.id}
          rangeData={range}
          selectedTool={selectedTool}
          showMultiplicityTrees={showMultiplicityTrees}
          startEditMode={editRangeID && editRangeID === range.id ? true : false}
        />
      ))}
    </g>
  );
}

export default RangesWrapper(memo(Ranges));
