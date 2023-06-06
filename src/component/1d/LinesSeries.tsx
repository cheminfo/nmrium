import { Spectrum1D } from 'nmr-load-save';

import { get1DDataXY } from '../../data/data1d/Spectrum1D/get1DDataXY';
import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D';
import { useChartData } from '../context/ChartContext';
import { useActiveSpectra } from '../hooks/useActiveSpectra';

import Line from './Line';

function LinesSeries() {
  const { data, displayerKey, xDomains } = useChartData();
  const activeSpectra = useActiveSpectra();

  const spectra = (data?.filter(
    (d) => isSpectrum1D(d) && d.display.isVisible && xDomains[d.id],
  ) || []) as Spectrum1D[];
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`} className="spectrums">
      {spectra.map((d, i) => (
        <g key={d.id} id={d.id}>
          <Line display={d.display} id={d.id} data={get1DDataXY(d)} index={i} />
        </g>
      ))}

      {activeSpectra?.map((activeSpectrum) => (
        <use key={activeSpectrum.id} href={`#${activeSpectrum.id}`} />
      ))}
    </g>
  );
}

export default LinesSeries;
