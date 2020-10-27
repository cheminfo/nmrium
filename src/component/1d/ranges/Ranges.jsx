import React, { memo } from 'react';

import RangesWrapper from '../../hoc/RangesWrapper';

import Range from './Range';

const Ranges = memo(({ ranges }) => {
  return (
    <g clipPath="url(#clip)">
      {ranges &&
        ranges.values &&
        ranges.values.map((range) => (
          <Range key={range.id} rangeData={range} />
        ))}
    </g>
  );
});

export default RangesWrapper(Ranges);
