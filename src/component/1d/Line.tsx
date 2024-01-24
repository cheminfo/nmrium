import { CSSProperties, useMemo } from 'react';

import { useScaleChecked } from '../context/ScaleContext';
import useActiveSpectrumStyleOptions from '../hooks/useActiveSpectrumStyleOptions';
import useXYReduce, { XYReducerDomainAxis } from '../hooks/useXYReduce';
import { PathBuilder } from '../utility/PathBuilder';
import { parseColor } from '../utility/parseColor';

interface LineProps {
  data?: {
    x: Float64Array;
    y: Float64Array;
  };
  id: string;
  display: {
    color: CSSProperties['stroke'];
  };
  index: number;
}

function Line({ data, id, display, index }: LineProps) {
  const { scaleX, scaleY, shiftY } = useScaleChecked();
  const xyReduce = useXYReduce(XYReducerDomainAxis.XAxis);
  const { opacity } = useActiveSpectrumStyleOptions(id);

  const paths = useMemo(() => {
    const _scaleX = scaleX();
    const _scaleY = scaleY(id);

    const pathBuilder = new PathBuilder();
    if (data?.x && data?.y && _scaleX(0)) {
      const pathPoints = xyReduce(data);

      pathBuilder.moveTo(_scaleX(pathPoints.x[0]), _scaleY(pathPoints.y[0]));
      for (let i = 1; i < pathPoints.x.length; i++) {
        pathBuilder.lineTo(_scaleX(pathPoints.x[i]), _scaleY(pathPoints.y[i]));
      }

      return pathBuilder.toString();
    } else {
      return '';
    }
  }, [scaleX, scaleY, id, data, xyReduce]);

  const { color: stroke, opacity: strokeOpacity } = parseColor(
    display?.color || 'black',
  );

  return (
    <path
      id={id}
      className="line"
      data-testid="spectrum-line"
      stroke={stroke}
      fill="none"
      strokeOpacity={opacity === 1 ? strokeOpacity : opacity}
      d={paths}
      transform={`translate(0,-${shiftY * index})`}
    />
  );
}

export default Line;
