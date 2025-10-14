import type { ScaleLinear } from 'd3-scale';
import { useMemo } from 'react';

import { getXScale } from '../1d/utilities/scale.js';
import { useChartData } from '../context/ChartContext.js';

export function useXScale(): ScaleLinear<any, any> {
  const { width, margin, xDomains, xDomain, mode } = useChartData();

  return useMemo(
    () => getXScale({ width, margin, xDomains, xDomain, mode }),
    [margin, mode, width, xDomain, xDomains],
  );
}
