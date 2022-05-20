import { useContext, useEffect, useState } from 'react';

import { addJcamp } from '../../../data/SpectraManager';
import { Datum1D } from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import { useScaleChecked } from '../../context/ScaleContext';
import { useAlert } from '../../elements/popup/Alert';
import { HighlightedSource, useHighlightData } from '../../highlight';
import { spinnerContext } from '../../loader/SpinnerContext';
import { loadFile } from '../../utility/FileUtility';

function DatabaseSpectrum() {
  const { displayerKey } = useChartData();
  const [path, setPath] = useState<string>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const { highlight } = useHighlightData();
  const { scaleX, scaleY } = useScaleChecked();
  const alert = useAlert();

  const { jcampURL: jcampRelativeURL, baseURL } =
    highlight?.sourceData?.extra || [];
  const getSpinner = useContext(spinnerContext);

  useEffect(() => {
    void (async () => {
      try {
        const jcampURL = new URL(jcampRelativeURL, baseURL);
        setLoading(true);
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
    })();
  }, [alert, baseURL, jcampRelativeURL, scaleX, scaleY]);

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
      width="100%"
      height="100%"
    >
      <path stroke="black" fill="none" d={path} />
    </g>
  );
}

export default DatabaseSpectrum;
