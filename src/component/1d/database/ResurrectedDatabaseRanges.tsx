import type { Spectrum1D } from '@zakodium/nmrium-core';
import { extent } from 'd3';
import { rangesToXY } from 'nmr-processing';

import { useChartData } from '../../context/ChartContext.js';
import { useScaleChecked } from '../../context/ScaleContext.js';
import { useHighlightData } from '../../highlight/index.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { useVerticalAlign } from '../../hooks/useVerticalAlign.js';
import { PathBuilder } from '../../utility/PathBuilder.js';
import { getYScale } from '../utilities/scale.js';

const emptyData = { info: { originFrequency: 400 } };

function ResurrectedDatabaseRanges() {
  const { height, margin, yDomains } = useChartData();
  const verticalAlign = useVerticalAlign();

  const { info } = useSpectrum(emptyData) as Spectrum1D;
  const { highlight } = useHighlightData();
  const { scaleX, spectraBottomMargin } = useScaleChecked();
  const { color, marginBottom } = usePanelPreferences('database');

  if (highlight.sourceData?.type !== 'DATABASE') {
    return null;
  }

  const fullHeight = height - margin.bottom;
  const blockHeight = fullHeight / 4;
  const translateY = fullHeight - blockHeight - marginBottom;

  const { ranges = [] } = highlight.sourceData.extra || {};

  const yDomain: number[] = [0, 0];

  const spectra = ranges.map((range) => {
    const { from, to } = range;
    const diff = Math.abs(from - to) / 2;
    const newForm = from - diff;
    const newTo = to + diff;
    const data = rangesToXY([range], {
      frequency: info.originFrequency,
      from: newForm,
      to: newTo,
      nbPoints: 256,
    });
    //calculate y domain
    const domain = extent(data.y) as number[];
    yDomain[0] = Math.min(domain[0], yDomain[0]);
    yDomain[1] = Math.max(domain[1], yDomain[1]);

    return { data, from: newForm, to: newTo };
  });

  const scaleY = getYScale({
    height: blockHeight,
    margin: { top: 0, bottom: 0 },
    verticalAlign,
    yDomain,
    yDomains,
    spectraBottomMargin,
  });

  const finalScaleX = scaleX();

  const paths = spectra.map(({ data: { x, y }, from, to }) => {
    const pathBuilder = new PathBuilder();
    pathBuilder.moveTo(finalScaleX(x[0]), scaleY(y[0]));
    for (let i = 1; i < x.length; i++) {
      pathBuilder.lineTo(finalScaleX(x[i]), scaleY(y[i]));
    }
    return { path: pathBuilder.toString(), from, to };
  });

  return (
    <g className="resurrected-database-ranges" width="100%" height="100%">
      {paths.map(({ path, from, to }, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={`${index}`}>
          <g transform={`translate(${scaleX()(to)},0)`}>
            <rect
              x="0"
              width={Math.abs(scaleX()(to) - scaleX()(from))}
              height="100%"
              fill="#ff6f0057"
            />
          </g>
          <path
            transform={`translate(0,${translateY})`}
            stroke={color}
            fill="none"
            d={path}
          />
        </g>
      ))}
    </g>
  );
}

export default ResurrectedDatabaseRanges;
