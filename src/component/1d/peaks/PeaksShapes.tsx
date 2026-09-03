import type { Spectrum1D } from '@zakodium/nmrium-core';
import { isSpectrum1D } from '@zakodium/nmrium-core';

import { useScale } from '../../context/ScaleContext.js';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum.js';
import { useActiveSpectrumPeaksViewState } from '../../hooks/useActiveSpectrumPeaksViewState.js';
import useSpectrum from '../../hooks/useSpectrum.js';

import { usePeakShapesPath } from './usePeakShapesPath.js';

type PeaksShapesMode = 'peakShape' | 'peaksSum';

export function PeaksShapes() {
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
      {showPeaksShapes && <PeaksShapesItems vAlign={shift} mode="peakShape" />}
      {showPeaksSum && <PeaksShapesItems vAlign={shift} mode="peaksSum" />}
    </g>
  );
}

function PeaksShapesItems(props: { vAlign: number; mode: PeaksShapesMode }) {
  const spectrum = useSpectrum();

  if (!isSpectrum1D(spectrum)) {
    return null;
  }

  return <PeaksShapesItemsContent spectrum={spectrum} {...props} />;
}

function PeaksShapesItemsContent(props: {
  spectrum: Spectrum1D;
  vAlign: number;
  mode: PeaksShapesMode;
}) {
  const { spectrum, vAlign, mode } = props;
  const {
    id,
    info: { originFrequency },
  } = spectrum;
  const getPath = usePeakShapesPath(id, originFrequency);

  const {
    peaks: { values: peaksList },
  } = spectrum;

  if (peaksList.length === 0) {
    return null;
  }

  const transform = `translate(0,-${vAlign})`;

  if (mode === 'peakShape') {
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
              transform={transform}
            />
          );
        })}
      </g>
    );
  }

  const { fill, path } = getPath({
    target: 'peaksSum',
    peaks: peaksList,
  });

  return <path stroke="darkblue" fill={fill} d={path} transform={transform} />;
}
