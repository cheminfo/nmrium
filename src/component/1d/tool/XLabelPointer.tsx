import { Spectrum1D } from 'nmr-load-save';
import { useCallback, CSSProperties } from 'react';

import { useBrushTracker } from '../../EventsTrackers/BrushTracker';
import { useMouseTracker } from '../../EventsTrackers/MouseTracker';
import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus';
import useSpectrum from '../../hooks/useSpectrum';

const style: CSSProperties = {
  cursor: 'crosshair',
  transformOrigin: 'bottom right',
  position: 'absolute',
  top: '-18px',
  left: '-30px',
  pointerEvents: 'none',
  overflow: 'visible',
  userSelect: 'none',
};

function XLabelPointer() {
  const { height, width, margin } = useChartData();
  const activeSpectrum = useSpectrum(null);
  const { scaleX } = useScaleChecked();

  const position = useMouseTracker();
  const brushState = useBrushTracker();

  const format = useFormatNumberByNucleus(
    (activeSpectrum as Spectrum1D)?.info.nucleus,
  );

  const getXValue = useCallback(
    (xVal) => {
      if (activeSpectrum) {
        const xInvert = scaleX().invert(xVal);
        return format(xInvert);
      }
    },
    [activeSpectrum, format, scaleX],
  );

  if (
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
  return (
    <div
      key="xLabelPointer"
      style={{
        ...style,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <span>{getXValue(position.x)}</span>
    </div>
  );
}

export default XLabelPointer;
