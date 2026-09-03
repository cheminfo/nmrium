import { isSpectrum1D } from '@zakodium/nmrium-core';

import { useScale } from '../../context/ScaleContext.js';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum.js';
import { useActiveSpectrumPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState.js';
import useSpectrum from '../../hooks/useSpectrum.js';

import { usePeakShapesPath } from './usePeakShapesPath.js';

function PeaksShapes() {
  const { shiftY } = useScale();
  const { showPeaksShapes, showPeaksSum } = useActiveSpectrumPeaksViewState();
  const activeSpectrum = useActiveSpectrum();
  const spectrum = useSpectrum();

  if (!isSpectrum1D(spectrum)) {
    return null;
  }

  const { peaks, display } = spectrum;

  if (!peaks?.values || !display.isVisible) {
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
  const spectrum = useSpectrum();
  const getPath = usePeakShapesPath(spectrum);

  if (!isSpectrum1D(spectrum)) {
    return null;
  }

  const {
    peaks: { values: peaksList },
  } = spectrum;

  if (peaksList.length === 0) {
    return null;
  }

  return (
    <g>
      {peaksList.map((peak) => {
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
  const spectrum = useSpectrum();
  const getPath = usePeakShapesPath(spectrum);

  if (!isSpectrum1D(spectrum)) {
    return null;
  }

  const {
    peaks: { values: peaksList },
  } = spectrum;

  if (peaksList.length === 0) {
    return null;
  }

  const { fill, path } = getPath({
    target: 'peaksSum',
    peaks: peaksList,
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
