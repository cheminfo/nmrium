import { memo, useEffect, useState } from 'react';

import RangesWrapper from '../../hoc/RangesWrapper';
import Events from '../../utility/Events';

import Range from './Range';

const Ranges = memo(({ ranges }) => {
  const [isMultiplicityTreesVisibile, showMultiplicityTrees] = useState(false);

  useEffect(() => {
    Events.on('showMultiplicityTrees', (flag) => {
      showMultiplicityTrees(flag);
    });
  }, []);

  return (
    <g clipPath="url(#clip)">
      {ranges &&
        ranges.values &&
        ranges.values.map((range) => (
          <Range
            key={range.id}
            rangeData={range}
            showMultiplicityTrees={isMultiplicityTreesVisibile}
          />
        ))}
    </g>
  );
});

export default RangesWrapper(Ranges);
