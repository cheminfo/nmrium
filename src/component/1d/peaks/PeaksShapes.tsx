import type { Spectrum1D } from 'nmr-load-save';

import { useScale } from '../../context/ScaleContext.js';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum.js';
import { useActiveSpectrumPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState.js';
import useSpectrum from '../../hooks/useSpectrum.js';

import { usePeakShapesPath } from './usePeakShapesPath.js';

const emptyData = { peaks: {}, display: {} };

function PeaksShapes() {
  const { shiftY } = useScale();
  const { showPeaksShapes, showPeaksSum } = useActiveSpectrumPeaksViewState();
  const activeSpectrum = useActiveSpectrum();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;

  if (!spectrum?.peaks?.values || !spectrum.display.isVisible) {
    return null;
  }

  const shift = (activeSpectrum?.index || 0) * shiftY;

  return (
    <g className="peaks-shapes">
      {showPeaksShapes && <PeaksShapesItems vAlign={shift} />}
      {showPeaksSum && <PeaksShapesSum vAlign={shift} />}
    </g>
  );
}

function PeaksShapesItems(props: { vAlign: number }) {
  const spectrum = useSpectrum(emptyData) as Spectrum1D;
  const getPath = usePeakShapesPath(spectrum);

  return (
    <g>
      {' '}
      {spectrum.peaks.values.map((peak) => {
        const { fill, path } = getPath({ target: 'peakShape', peak });
        return (
          <path
            key={peak.id}
            fill={fill}
            fillOpacity={0.3}
            d={path}
            transform={`translate(0,-${props.vAlign})`}
          />
        );
      })}
    </g>
  );
}

function PeaksShapesSum(props: { vAlign: number }) {
  const spectrum = useSpectrum(emptyData) as Spectrum1D;
  const getPath = usePeakShapesPath(spectrum);

  const { fill, path } = getPath({
    target: 'peaksSum',
    peaks: spectrum.peaks.values,
  });

  return (
    <path
      stroke={'darkblue'}
      fill={fill}
      d={path}
      transform={`translate(0,-${props.vAlign})`}
    />
  );
}

export default PeaksShapes;
