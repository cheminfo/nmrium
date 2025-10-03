import type { Spectrum1D } from '@zakodium/nmrium-core';

import { useBrushTracker } from '../../EventsTrackers/BrushTracker.js';
import { useMouseTracker } from '../../EventsTrackers/MouseTracker.js';
import { useChartData } from '../../context/ChartContext.js';
import { useScaleChecked } from '../../context/ScaleContext.js';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum.js';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus.js';
import { options } from '../../toolbar/ToolTypes.js';
import { getClosePeak } from '../../utility/getClosePeak.js';

const styles = {
  radius: 10,
  borderColor: '#1f1f1f',
  strokeWidth: 1,
  fillOpacity: 0,
  SVGPadding: 1,
};

const LOOK_WIDTH = 10;

function PeakPointer() {
  const {
    height,
    width,
    margin,
    toolOptions: { selectedTool },
  } = useChartData();
  const { scaleX, scaleY, shiftY } = useScaleChecked();

  const activeSpectrum = useActiveSpectrum();
  const spectra = useSpectraByActiveNucleus();
  const position = useMouseTracker();
  const brushState = useBrushTracker();

  if (
    selectedTool !== options.peakPicking.id ||
    !activeSpectrum ||
    brushState.step === 'brushing' ||
    !position ||
    position.y < margin.top ||
    position.x < margin.left ||
    position.x > width - margin.right ||
    position.y > height - margin.bottom
  ) {
    return null;
  }

  const spectrumIndex = spectra.findIndex((d) => d.id === activeSpectrum.id);

  if (spectrumIndex === -1) return null;

  const fromTo = [
    scaleX().invert(position.x - LOOK_WIDTH),
    scaleX().invert(position.x + LOOK_WIDTH),
  ];
  fromTo.sort((a, b) => {
    return a - b;
  });

  const closePeak = getClosePeak(spectra[spectrumIndex] as Spectrum1D, {
    from: fromTo[0],
    to: fromTo[1],
  });
  if (!closePeak) return null;

  const x = scaleX()(closePeak.x);
  const y = scaleY(activeSpectrum.id)(closePeak.y) - spectrumIndex * shiftY;

  return (
    <div
      key="peakPointer"
      style={{
        cursor: 'crosshair',
        transform: `translate(${x}px, ${y}px)`,
        transformOrigin: 'top left',
        position: 'absolute',
        top: -(styles.radius + styles.SVGPadding),
        left: -(styles.radius + styles.SVGPadding),
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <svg
        width={styles.radius * 2 + styles.SVGPadding * 2}
        height={styles.radius * 2 + styles.SVGPadding * 2}
      >
        <circle
          cx={styles.radius + styles.SVGPadding}
          cy={styles.radius + styles.SVGPadding}
          r={styles.radius}
          stroke={styles.borderColor}
          strokeWidth={styles.strokeWidth}
          fillOpacity={styles.fillOpacity}
        />
        <line
          x1={styles.radius + styles.SVGPadding}
          y1={styles.SVGPadding}
          x2={styles.radius + styles.SVGPadding}
          y2={styles.radius * 2 + styles.SVGPadding}
          stroke={styles.borderColor}
          strokeWidth={styles.strokeWidth}
        />
        <line
          x1={styles.SVGPadding}
          y1={styles.radius + styles.SVGPadding}
          x2={styles.radius * 2 + styles.SVGPadding}
          y2={styles.radius + styles.SVGPadding}
          stroke={styles.borderColor}
          strokeWidth={styles.strokeWidth}
        />
      </svg>
    </div>
  );
}

export default PeakPointer;
