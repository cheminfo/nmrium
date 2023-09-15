import { useChartData } from '../../../context/ChartContext';
import { SpectrumPhaseTrace } from './SpectrumPhaseTrace';
import { get2DYScale } from '../../utilities/scale';
import { useActivePhaseTraces } from './useActivePhaseTraces';

export function SpectraPhaseTraces() {
  const { width, height, margin, yDomain } = useChartData();
  const { spectra = [], color, activeTraceDirection } = useActivePhaseTraces();

  if (!width || !height) {
    return null;
  }

  const scale2dY = get2DYScale({ margin, height, yDomain });

  if (spectra.length === 0) {
    return null;
  }

  return spectra.map(({ id, data, y }) => {
    return (
      <SpectrumPhaseTrace
        key={id}
        data={data}
        yShift={scale2dY(y)}
        color={color}
        direction={activeTraceDirection}
      />
    );
  });
}
