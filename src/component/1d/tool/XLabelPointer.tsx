import { useContext, useCallback, useMemo, CSSProperties } from 'react';

import { Datum1D } from '../../../data/types/data1d';
import { BrushContext } from '../../EventsTrackers/BrushTracker';
import { MouseContext } from '../../EventsTrackers/MouseTracker';
import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useFormatNumberByNucleus } from '../../hooks/useFormatNumberByNucleus';
import { useActiveSpectrum } from '../../reducer/Reducer';

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
  const { height, width, margin, data } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const { scaleX } = useScaleChecked();

  const position = useContext(MouseContext);
  const brushState = useContext(BrushContext);
  const activeSpectrumData = useMemo(() => {
    const spectrumData = activeSpectrum
      ? data.find((d) => d.id === activeSpectrum.id)
      : null;
    return spectrumData;
  }, [activeSpectrum, data]);

  const format = useFormatNumberByNucleus(
    (activeSpectrumData as Datum1D)?.info.nucleus,
  );

  const getXValue = useCallback(
    (xVal) => {
      if (activeSpectrumData) {
        const xInvert = scaleX().invert(xVal);
        return format(xInvert);
      }
    },
    [activeSpectrumData, format, scaleX],
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
