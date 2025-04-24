import type { DataXY } from 'cheminfo-types';
import type { Peak1D } from 'nmr-processing';
import { peaksToXY, peakToXY } from 'nmr-processing';
import type { Spectrum1D } from 'nmrium-core';

import { useChartData } from '../../context/ChartContext.js';
import { useScaleChecked } from '../../context/ScaleContext.js';
import { PathBuilder } from '../../utility/PathBuilder.js';

type PeaksShapesOptions =
  | {
      target: 'peakShape';
      peak: Peak1D;
    }
  | {
      target: 'peaksSum';
      peaks: Peak1D[];
    };

export function usePeakShapesPath(spectrum: Spectrum1D) {
  const { scaleX, scaleY } = useScaleChecked();
  const { width, xDomain } = useChartData();
  return function getPath(options: PeaksShapesOptions): {
    path: string;
    fill: string;
  } {
    const { target } = options;

    const frequency = spectrum.info.originFrequency;
    let pathSeries: DataXY | null = null;
    switch (target) {
      case 'peakShape': {
        const { peak } = options;
        pathSeries = peakToXY(peak, {
          frequency,
          nbPoints: 1024,
          from: peak.x - (peak.width / frequency) * 9,
          to: peak.x + (peak.width / frequency) * 9,
        });
        break;
      }
      case 'peaksSum': {
        const { peaks } = options;
        pathSeries = peaksToXY(peaks, {
          frequency,
          nbPoints: width,
          from: xDomain[0],
          to: xDomain[1],
        });
        break;
      }
      default:
        break;
    }
    const _scaleX = scaleX();
    const _scaleY = scaleY(spectrum.id);

    const pathBuilder = new PathBuilder();
    let fill = 'transparent';

    if (pathSeries) {
      const { x, y } = pathSeries;
      pathBuilder.moveTo(_scaleX(x[0]), _scaleY(y[0]));
      for (let i = 1; i < x.length; i++) {
        pathBuilder.lineTo(_scaleX(x[i]), _scaleY(y[i]));
      }

      if (target === 'peakShape') {
        pathBuilder.closePath();
        fill = 'black';
      }
    }

    return { path: pathBuilder.toString(), fill };
  };
}
