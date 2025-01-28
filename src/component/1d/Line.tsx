import type { CSSProperties } from 'react';
import { useMemo } from 'react';

import { useScaleChecked } from '../context/ScaleContext.js';
import useActiveSpectrumStyleOptions from '../hooks/useActiveSpectrumStyleOptions.js';
import useXYReduce, { XYReducerDomainAxis } from '../hooks/useXYReduce.js';
import { PathBuilder } from '../utility/PathBuilder.js';
import { parseColor } from '../utility/parseColor.js';

import { useInsetOptions } from './inset/InsetProvider.js';

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
  const { id: insetKey = 'primary' } = useInsetOptions() || {};

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

  let pathOpacity = opacity === 1 ? strokeOpacity : opacity;

  if (insetKey !== 'primary') {
    pathOpacity = 1;
  }

  return (
    <path
      id={`${id}-${insetKey}`}
      className="line"
      data-testid="spectrum-line"
      stroke={stroke}
      fill="none"
      strokeOpacity={pathOpacity}
      d={paths}
      transform={`translate(0,-${shiftY * index})`}
    />
  );
}

export default Line;
