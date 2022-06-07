import throttle from 'lodash/throttle';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { addJcamp } from '../../../data/SpectraManager';
import { Datum1D } from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useAlert } from '../../elements/popup/Alert';
import { HighlightedSource, useHighlightData } from '../../highlight';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { spinnerContext } from '../../loader/SpinnerContext';
import { loadFile } from '../../utility/FileUtility';
import { getYScale } from '../utilities/scale';

function DatabaseSpectrum() {
  const { displayerKey, height, verticalAlign, yDomain, margin } =
    useChartData();
  const [path, setPath] = useState<string>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const { highlight } = useHighlightData();
  const { scaleX } = useScaleChecked();
  const alert = useAlert();
  const { color, marginBottom } = usePanelPreferences('database');
  const { jcampURL: jcampRelativeURL, baseURL } =
    highlight?.sourceData?.extra || [];
  const getSpinner = useContext(spinnerContext);

  const scaleY = useCallback(
    () =>
      getYScale({
        height: height,
        margin: { top: margin.top, bottom: margin.bottom + marginBottom },
        verticalAlign,
        yDomain,
      }),
    [height, margin, marginBottom, verticalAlign, yDomain],
  );

  const loadSpectrum = useRef(
    throttle(async (baseURL: string, jcampRelativeURL: string) => {
      try {
        setLoading(true);
        const jcampURL = new URL(jcampRelativeURL, baseURL);
        const result = await loadFile(jcampURL);
        const spectra = [];
        addJcamp(spectra, result, {}, {});
        setLoading(false);
        const spectrum = spectra?.[0] || null;
        if (spectrum) {
          const { x, re: y } = (spectrum as Datum1D)?.data;
          let path = `M ${scaleX()(x[0])} ${scaleY()(y[0])} `;
          path += x.slice(1).reduce((accumulator, point, i) => {
            accumulator += ` L ${scaleX()(point)} ${scaleY()(y[i + 1])}`;
            return accumulator;
          }, '');
          setPath(path);
        }
      } catch (e) {
        alert.error('Failed to Load spectrum');
      }
    }, 250),
  );

  useEffect(() => {
    void loadSpectrum.current(baseURL, jcampRelativeURL);
  }, [baseURL, jcampRelativeURL, loadSpectrum]);

  if (highlight.sourceData?.type !== HighlightedSource.DATABASE) {
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
