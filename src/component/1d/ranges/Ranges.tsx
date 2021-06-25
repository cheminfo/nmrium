import { memo, useEffect, useState } from 'react';

import RangesWrapper from '../../hoc/RangesWrapper';
import Events from '../../utility/Events';

import Range, { RangeData } from './Range';

interface RangesProps {
  displayerKey: string;
  selectedTool: string;
  ranges: {
    values: Array<RangeData>;
  };
  editRangeID: string;
}

function Ranges({
  ranges,
  displayerKey,
  selectedTool,
  editRangeID,
}: RangesProps) {
  const [isMultiplicityTreesVisibile, showMultiplicityTrees] = useState(false);

  useEffect(() => {
    Events.on('showMultiplicityTrees', (flag) => {
      showMultiplicityTrees(flag);
    });
  }, []);

  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {ranges?.values?.map((range) => (
        <Range
          key={range.id}
          rangeData={range}
          selectedTool={selectedTool}
          showMultiplicityTrees={isMultiplicityTreesVisibile}
          startEditMode={editRangeID && editRangeID === range.id ? true : false}
        />
      ))}
    </g>
  );
}

export default RangesWrapper(memo(Ranges));
