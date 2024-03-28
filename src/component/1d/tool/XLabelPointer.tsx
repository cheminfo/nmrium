import { Spectrum1D } from 'nmr-load-save';
import { CSSProperties } from 'react';

import { useBrushTracker } from '../../EventsTrackers/BrushTracker';
import { useMouseTracker } from '../../EventsTrackers/MouseTracker';
import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus';
import useSpectrum from '../../hooks/useSpectrum';

const style: CSSProperties = {
  cursor: 'crosshair',
  position: 'absolute',
  paddingRight: '5px',
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

  const x = scaleX().invert(position.x);

  return (
    <div
      style={{
        ...style,
        transform: `translate(${position.x}px, ${position.y}px) translate(-100%,-100%)`,
      }}
    >
      <span>{format(x)}</span>
    </div>
  );
}

export default XLabelPointer;
