import { memo, useEffect, useState } from 'react';

import RangesWrapper from '../../hoc/RangesWrapper';
import Events from '../../utility/Events';

import Range from './Range';

function Ranges({ ranges, displayerKey, selectedTool }) {
  const [isMultiplicityTreesVisibile, showMultiplicityTrees] = useState(false);

  useEffect(() => {
    Events.on('showMultiplicityTrees', (flag) => {
      showMultiplicityTrees(flag);
    });
  }, []);

  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {ranges &&
        ranges.values &&
        ranges.values.map((range) => (
          <Range
            key={range.id}
            rangeData={range}
            selectedTool={selectedTool}
            showMultiplicityTrees={isMultiplicityTreesVisibile}
          />
        ))}
    </g>
  );
}

export default RangesWrapper(memo(Ranges));
