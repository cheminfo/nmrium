import max from 'ml-array-max';
import { Spectrum1D } from 'nmr-load-save';

import { get1DDataXY } from '../../../data/data1d/Spectrum1D/get1DDataXY';
import { useBrushTracker } from '../../EventsTrackers/BrushTracker';
import { useMouseTracker } from '../../EventsTrackers/MouseTracker';
import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus';
import { options } from '../../toolbar/ToolTypes';

const styles = {
  radius: 10,
  borderColor: '#1f1f1f',
  strokeWidth: 1,
  fillOpacity: 0,
  SVGPadding: 1,
};

interface PeakPosition {
  x: number;
  y: number;
}

const LookWidth = 10;

function getClosePeak(
  spectrum: Spectrum1D,
  range: number[],
): PeakPosition | null {
  const datum = get1DDataXY(spectrum);
  const maxIndex = datum.x.findIndex((number) => number >= range[1]) - 1;
  const minIndex = datum.x.findIndex((number) => number >= range[0]);

  const yDataRange = datum.y.slice(minIndex, maxIndex);
  if (!yDataRange || yDataRange.length === 0) return null;

  const y = max(yDataRange);
  const xIndex = minIndex + yDataRange.indexOf(y);
  const x = datum.x[xIndex];

  return { x, y };
}

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

  const range = [
    scaleX().invert(position.x - LookWidth),
    scaleX().invert(position.x + LookWidth),
  ].sort((a, b) => {
    return a - b;
  });

  const closePeak = getClosePeak(spectra[spectrumIndex] as Spectrum1D, range);
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
