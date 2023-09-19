import { useChartData } from '../../../context/ChartContext';
import { get2DXScale, get2DYScale } from '../../utilities/scale';

import { SpectrumPhaseTrace } from './SpectrumPhaseTrace';
import { useActivePhaseTraces } from './useActivePhaseTraces';

export function SpectraPhaseTraces() {
  const { width, height, margin, yDomain, xDomain } = useChartData();
  const { spectra = [], color, activeTraceDirection } = useActivePhaseTraces();

  if (!width || !height) {
    return null;
  }
  const scale2dX = get2DXScale({ margin, width, xDomain });
  const scale2dY = get2DYScale({ margin, height, yDomain });

  if (spectra.length === 0) {
    return null;
  }

  return spectra.map(({ id, data, x, y }) => {
    return (
      <SpectrumPhaseTrace
        key={id}
        data={data}
        position={{ x: scale2dX(x), y: scale2dY(y) }}
        color={color}
        direction={activeTraceDirection}
      />
    );
  });
}
