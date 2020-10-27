import React, { memo, useMemo } from 'react';

import MultiAnalysisWrapper from '../../hoc/MultiAnalysisWrapper';

import AnalysisRange from './AnalysisRange';

// import Range from './Range';

const MultiAnalysisRanges = memo(({ activeTab, spectraAanalysis }) => {
  const ranges = useMemo(() => {
    const ranges = [];

    if (spectraAanalysis && spectraAanalysis[activeTab]) {
      const result = Object.values(spectraAanalysis[activeTab].values);
      if (result[0]) {
        Object.keys(result[0]).forEach((key) => {
          if (!['key'].includes(key)) {
            ranges.push(result[0][key]);
          }
        });
      }
    }
    return ranges;
  }, [activeTab, spectraAanalysis]);

  if (!ranges || ranges.length === 0) {
    return null;
  }

  return (
    <g clipPath="url(#clip)">
      {ranges.map((range) => (
        <AnalysisRange key={range.colKey} rangeData={range} />
      ))}
    </g>
  );
});

export default MultiAnalysisWrapper(MultiAnalysisRanges);
