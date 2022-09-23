import { DataXY, DoubleArray } from 'cheminfo-types';
import { peakToXY, peaksToXY } from 'nmr-processing';

import { Datum1D, Peak } from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { PathBuilder } from '../../utility/PathBuilder';

type PeaksShapesOptions =
  | {
      target: 'peakShape';
      peak: Peak;
    }
  | {
      target: 'peaksSum';
      peaks: Peak[];
    };

export function usePeakShapesPath(spectrum: Datum1D) {
  const { scaleX, scaleY } = useScaleChecked();
  const { width, xDomain } = useChartData();
  return function getPath(options: PeaksShapesOptions): {
    path: string;
    fill: string;
  } {
    const { target } = options;

    const frequency = spectrum.info.originFrequency;
    let pathSeries: DataXY<DoubleArray> | null = null;
    switch (target) {
      case 'peakShape':
        pathSeries = peakToXY(options.peak, {
          frequency,
          nbPoints: 1024,
          from: options.peak.x - (options.peak.width / frequency) * 9,
          to: options.peak.x + (options.peak.width / frequency) * 9,
        });
        break;
      case 'peaksSum':
        pathSeries = peaksToXY(options.peaks, {
          frequency,
          nbPoints: width,
          from: xDomain[0],
          to: xDomain[1],
        });
        break;
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
