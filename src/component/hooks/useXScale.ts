import { ScaleLinear } from 'd3';
import { useMemo } from 'react';

import { getXScale } from '../1d/utilities/scale';
import { useChartData } from '../context/ChartContext';

export function useXScale(): ScaleLinear<any, any, never> {
  const { width, margin, xDomains, xDomain, mode } = useChartData();

  return useMemo(
    () => getXScale({ width, margin, xDomains, xDomain, mode }),
    [margin, mode, width, xDomain, xDomains],
  );
}
