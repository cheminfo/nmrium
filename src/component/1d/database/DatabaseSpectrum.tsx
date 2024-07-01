import { extent } from 'd3';
import throttle from 'lodash/throttle';
import { readFromWebSource, Spectrum1D } from 'nmr-load-save';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useToaster } from '../../context/ToasterContext';
import { HighlightEventSource, useHighlightData } from '../../highlight';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { spinnerContext } from '../../loader/SpinnerContext';
import { PathBuilder } from '../../utility/PathBuilder';
import { getYScaleWithRation } from '../utilities/scale';

function DatabaseSpectrum() {
  const { displayerKey, height, margin } = useChartData();
  const [path, setPath] = useState<string>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const { highlight } = useHighlightData();
  const { scaleX } = useScaleChecked();
  const toaster = useToaster();
  const { color, marginBottom } = usePanelPreferences('database');
  const { jcampURL: jcampRelativeURL = '', baseURL } =
    highlight?.sourceData?.extra || {};
  const getSpinner = useContext(spinnerContext);

  const scaleY = useCallback(
    (yDomain: number[]) =>
      getYScaleWithRation({
        yDomain,
        height,
        margin: {
          ...margin,
          bottom: margin.bottom + marginBottom,
          top: margin.top,
        },
        scaleRatio: 1,
      }),
    [height, margin, marginBottom],
  );

  const loadSpectrum = useRef(
    throttle(async (baseURL: string | undefined, jcampRelativeURL: string) => {
      try {
        setLoading(true);
        const url = new URL(jcampRelativeURL, baseURL);
        const { data } = await readFromWebSource({
          entries: [{ relativePath: url.pathname, baseURL: url.origin }],
        });
        setLoading(false);
        const spectrum = data?.spectra?.[0] || null;
        if (spectrum) {
          const pathBuilder = new PathBuilder();
          const { x, re: y } = (spectrum as Spectrum1D).data;
          const yDomain = extent(y) as number[];
          const finalScaleX = scaleX();
          const finalScaleY = scaleY(yDomain);

          pathBuilder.moveTo(finalScaleX(x[0]), finalScaleY(y[0]));
          for (let i = 1; i < x.length; i++) {
            pathBuilder.lineTo(finalScaleX(x[i]), finalScaleY(y[i]));
          }
          setPath(pathBuilder.toString());
        }
      } catch (error) {
        reportError(error);
        toaster.show({ message: 'Failed to Load spectrum', intent: 'danger' });
      }
    }, 250),
  );

  useEffect(() => {
    void loadSpectrum.current(baseURL, jcampRelativeURL);
  }, [baseURL, jcampRelativeURL, loadSpectrum]);

  if (highlight.sourceData?.type !== HighlightEventSource.DATABASE) {
    return null;
  }

  return isLoading ? (
    <foreignObject width="100%" height="100%">
      {getSpinner('Load Jcamp ....')}
    </foreignObject>
  ) : (
    <g
      clipPath={`url(#${displayerKey}clip-chart-1d)`}
      className="database-spectrum"
    >
      <path stroke={color} fill="none" d={path} />
    </g>
  );
}

export default DatabaseSpectrum;
