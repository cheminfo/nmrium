import { memo, useMemo } from 'react';

import PlotChart from './PlotChart';
import { processSnapPlot } from './processSnapPlot';

const yLogBase = 2;
interface Spectrum1DHistogramProps {
  color?: string;
  data: any;
}

function Spectrum1DHistogram({
  color = 'red',
  data,
}: Spectrum1DHistogramProps) {
  const processedData = useMemo(() => {
    return processSnapPlot('1D', data, yLogBase);
  }, [data]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'block' }}>
        <PlotChart
          data={processedData}
          sign="positive"
          color={color}
          yLogBase={yLogBase}
        />
      </div>
      <div style={{ display: 'block', width: 180, height: 180 }}>
        <PlotChart
          data={processedData}
          sign="negative"
          color={color}
          yLogBase={yLogBase}
          hideHeading
        />
      </div>
    </div>
  );
}

export default memo(Spectrum1DHistogram);
